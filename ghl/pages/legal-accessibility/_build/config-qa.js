// Dev-only QA for the port's configuration: GHL Custom Value substitution (modelled as GHL's text replacement of
// {{ custom_values.x }} in the pasted block), the logo (no request when unset), link availability (the legal pages,
// Home and the page-only "Contact us" section link, composed from the Contact page value), the legal pages bar (links,
// and the phone select: unavailable pages disabled, a configured page opened), the source prop showFlags, a hostile host
// with the script executed twice, a copied root with a changed config, teardown, and a browser without
// IntersectionObserver.
//   NODE_PATH=$(npm root -g) node config-qa.js <httpBase>      e.g. http://localhost:8123/
// (header, drawer, footer and re-render of the shared chrome: ghl/shared/site-chrome/qa/chrome-lifecycle.js)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const httpBase = (process.argv[2] || 'http://localhost:8123/').replace(/\/?$/, '/');
const SLUG = 'legal-accessibility', P = 'lac', KEY = '__bwciLegalAccessibility';
const ROOT = 'bwci-' + SLUG;
const PAGE = path.resolve(__dirname, '..');
const HOSTED = fs.readFileSync(path.join(PAGE, SLUG + '.ghl.html'), 'utf8');
const INLINE = fs.readFileSync(path.join(PAGE, SLUG + '.inline.ghl.html'), 'utf8');
const CFG_RE = new RegExp('(<script type="application/json" id="' + ROOT + '-config">)([\\s\\S]*?)(</script>)');
const withCfg = (block, edit) => block.replace(CFG_RE, (m, a, json, c) => { const o = JSON.parse(json); edit(o); return a + '\n' + JSON.stringify(o, null, 2) + '\n' + c; });
const substitute = (block, value) => block.replace(/\{\{\s*custom_values\.([a-z0-9_]+)\s*\}\}/g, (m, name) => { const v = value(name); return v === undefined ? m : v; });
const HOSTILE_CSS = 'html{font-size:10px}body{margin:0;font-family:Georgia,serif;font-size:20px;line-height:1.1;color:#f00;letter-spacing:.2em}*{box-sizing:content-box}' +
  'h1,h2,h3{font-family:Impact;font-size:50px;color:purple;margin:30px 0;text-transform:uppercase}p{margin:0 0 2em;font-size:22px}a{color:orange;text-decoration:underline}' +
  'nav{display:inline;padding:20px}ol,ul,li{list-style:disc;margin:20px;padding:20px}span{font-size:30px}aside{float:left;width:50%}article{padding:30px;border:3px solid red}' +
  'section{padding:40px;background:#eee}div{line-height:2}.above{height:300px;background:#223}';
const page = (block, opts) => {
  const o = opts || {};
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
    (o.hostile ? '<style>' + HOSTILE_CSS + '</style>' : '<style>body{margin:0}</style>') + '</head><body>' +
    (o.hostile ? '<div class="above">above</div><section style="padding:0">' : '') + block + (o.hostile ? '</section><div class="above">below</div>' : '') +
    (o.twice ? '<script>' + block.slice(block.lastIndexOf('<script>') + 8, block.lastIndexOf('</script>')) + '</script>' : '') + '</body></html>';
};
const URLS = (name) => (name === 'bwci_img_logo' ? httpBase + 'ghl/shared/site-chrome/assets/bwci-logo.png' :
  /^bwci_url_/.test(name) ? '/' + name.slice(9).replace(/_/g, '-') + '?v=1' : undefined);

const BAR = 'nav[aria-label="Legal pages"]';
const STATE = (args) => {
  const [rootId, p] = args;
  const r = document.getElementById(rootId);
  const a = (sel) => [...r.querySelectorAll(sel)].map((x) => x.getAttribute('data-' + p + '-link') + '=' + x.getAttribute('href') + (x.getAttribute('aria-disabled') ? '(off)' : '')).join(' ');
  const logo = r.querySelector('img[data-' + p + '-asset="logoImage"]');
  return {
    page: a('main a[data-' + p + '-link]'),
    logo: (logo.complete && logo.naturalWidth ? 'ok ' + logo.naturalWidth : 'none') + (logo.getAttribute('src') ? (logo.src.startsWith('data:') ? ' data' : ' url') : ' nosrc'),
    flag: (() => { const f = r.querySelector('[data-' + p + '-flag]'); return f.hidden ? 'hidden' : 'shown'; })(),
    bar: a('nav[aria-label="Legal pages"] a[data-' + p + '-link]'),
    select: (() => { const s = r.querySelector('nav[aria-label="Legal pages"] select'); return s.options[s.selectedIndex].textContent + ' | ' + [...s.options].map((o) => o.getAttribute('data-' + p + '-link') + '=' + o.value + (o.disabled ? '(off)' : '') + (o.label !== o.textContent ? ' "' + o.label + '"' : '')).join(' '); })(),
    index: [...r.querySelectorAll('[data-' + p + '-index] a')].filter((x) => x.getAttribute('aria-current')).map((x) => x.textContent).join(',') || 'none',
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
    p.on('console', (m) => { if (m.type() === 'error') errors.push(name + ' console: ' + m.text().slice(0, 140)); });
    const requests = [];
    p.on('request', (r) => requests.push(r.url()));
    await p.route(httpBase + 'variant.html', (r) => r.fulfill({ contentType: 'text/html; charset=utf-8', body: html }));
    await p.goto(httpBase + 'variant.html', { waitUntil: 'networkidle' });
    await p.waitForTimeout(400);
    res[name] = await fn(p, requests);
    await p.close();
  };
  const state = (p) => p.evaluate(STATE, [ROOT, P]);
  const imageRequests = (reqs) => reqs.filter((u) => /\.(png|jpe?g|webp)(\?|$)/.test(u)).length;

  await run('hosted literal', page(HOSTED), async (p, reqs) => Object.assign(await state(p), { imageRequests: imageRequests(reqs) }));
  await run('inline literal', page(INLINE), (p) => state(p));
  await run('hosted all #', page(substitute(HOSTED, () => '#')), async (p, reqs) => Object.assign(await state(p), { imageRequests: imageRequests(reqs) }));
  await run('inline empty', page(substitute(INLINE, () => '')), (p) => state(p));
  await run('hosted configured', page(substitute(HOSTED, URLS)), async (p, reqs) => Object.assign(await state(p), { imageRequests: imageRequests(reqs) }));
  // the Contact value with its own query and fragment: the section link keeps the query and replaces the fragment
  await run('contact URL with fragment', page(substitute(HOSTED, (n) => (n === 'bwci_url_contact' ? ' https://example.com/contact?a=1#top ' : URLS(n)))), async (p) => (await state(p)).page.split(' ').filter((x) => /^contactDetails/.test(x)).join(' '));
  await run('disabled click', page(HOSTED), async (p) => {
    const a = p.locator('main a[data-' + P + '-link="contactDetails"]');
    await a.scrollIntoViewIfNeeded(); await a.click({ force: true }); await p.waitForTimeout(200);
    return { url: p.url().replace(httpBase, ''), title: await a.getAttribute('title') };
  });
  await run('enabled click', page(substitute(HOSTED, URLS)), async (p) => {
    await p.route(httpBase + 'contact?v=1', (r) => r.fulfill({ contentType: 'text/html', body: 'contact' }));
    const a = p.locator('main a[data-' + P + '-link="contactDetails"]');
    await a.scrollIntoViewIfNeeded(); await p.waitForTimeout(200);
    await Promise.all([p.waitForURL('**/contact?v=1#cnt-details'), a.click()]);
    return p.url().replace(httpBase, '');
  });
  // the legal pages bar on a phone: the select opens a configured page; an unavailable one does not navigate
  await run('select configured', page(substitute(HOSTED, URLS)), async (p) => {
    await p.route(httpBase + 'terms?v=1', (r) => r.fulfill({ contentType: 'text/html', body: 'terms' }));
    const sel = p.locator(BAR + ' select');
    await Promise.all([p.waitForURL('**/terms?v=1'), sel.selectOption({ label: 'Terms' })]);
    return p.url().replace(httpBase, '');
  }, { viewport: { width: 390, height: 844 } });
  await run('select unavailable', page(HOSTED), async (p) => {
    const r = await p.evaluate((b) => {
      const sel = document.querySelector(b + ' select'); sel.selectedIndex = 3; sel.dispatchEvent(new Event('change', { bubbles: true }));
      return sel.options[sel.selectedIndex].textContent;
    }, BAR);
    await p.waitForTimeout(300);
    return { shows: r, url: p.url().replace(httpBase, ''), status: await p.evaluate((rootId) => [...document.getElementById(rootId).querySelectorAll('[role="status"], [aria-live]')].map((e) => e.textContent).filter(Boolean).join(' | '), ROOT) };
  }, { viewport: { width: 390, height: 844 } });
  // the source prop: default, off, and a non-boolean value (which keeps the default)
  await run('flags default', page(INLINE), async (p) => (await state(p)).flag);
  await run('flags off', page(withCfg(INLINE, (c) => { c.showFlags = false; })), async (p) => (await state(p)).flag);
  await run('flags "false" (string)', page(withCfg(INLINE, (c) => { c.showFlags = 'false'; })), async (p) => (await state(p)).flag);

  // a hostile host (generic CSS, content above and below, the script executed twice), desktop and phone
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    await run('hostile ' + w, page(INLINE, { hostile: true, twice: true }), async (p) => {
      const r = { owners: await p.evaluate(() => [document.querySelectorAll('[data-' + 'lac' + '-init]').length, Object.keys(window).filter((k) => /^__bwci/.test(k))]) };
      r.state = await state(p);
      r.layout = await p.evaluate((rootId) => {
        const root = document.getElementById(rootId);
        const pick = (s) => { const e = root.querySelector(s); const c = getComputedStyle(e); const b = e.getBoundingClientRect(); return Math.round(b.width) + 'x' + Math.round(b.height) + ' ' + c.display; };
        return [pick('nav[aria-label="Legal pages"]'), pick('.lac-lg-grid'), pick('.lac-lg-side'), pick('.lac-pg-doc h2'), getComputedStyle(root.querySelector('.lac-pg-doc h2')).fontFamily.split(',')[0]];
      }, ROOT);
      // the legal pages bar stays stuck under the sticky header while scrolling
      await p.evaluate(() => window.scrollTo({ top: 1500, behavior: 'instant' })); await p.waitForTimeout(400);
      r.barStuck = await p.evaluate((b) => { const n = document.querySelector(b).getBoundingClientRect(); const h = document.querySelector('header[class*="-hdr"]').getBoundingClientRect(); return Math.round(n.top) + ' ' + Math.round(h.bottom); }, BAR);
      // the index click inside the host lands the section below the sticky header
      await p.locator('[data-' + P + '-index] a').last().click(); await p.waitForTimeout(1500);
      r.jump = await p.evaluate((rootId) => Math.round(document.getElementById(rootId).querySelector('[data-lac-doc] section[id]:last-child').getBoundingClientRect().top) + ' ' + location.hash, ROOT);
      r.index = (await state(p)).index;
      r.overflowX = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      return r;
    }, { viewport: { width: w, height: h } });
  }
  // a copied live root (GHL re-render) with another index item marked, with a changed config
  await run('copied root', page(substitute(INLINE, URLS), { twice: true }), async (p) => {
    const r = {};
    await p.locator('[data-' + P + '-index] a').last().click(); await p.waitForTimeout(1500);
    r.before = await state(p);
    await p.evaluate((rootId) => {
      const cfgEl = document.getElementById(rootId + '-config');
      const cfg = JSON.parse(cfgEl.textContent); cfg.showFlags = false; cfg.links.contactDetails = '#'; cfg.links.home = '/new-home';
      cfgEl.textContent = JSON.stringify(cfg);
      window.scrollTo(0, 0);
      const old = document.getElementById(rootId);
      old.replaceWith(old.cloneNode(true));
    }, ROOT);
    await p.waitForTimeout(500);
    r.after = await state(p);
    r.owner = await p.evaluate((args) => { const a = window[args[0]]; return !!a && a.instance && a.instance.root === document.getElementById(args[1]); }, [KEY, ROOT]);
    return r;
  });
  await run('teardown', page(INLINE), async (p) => {
    await p.evaluate((rootId) => document.getElementById(rootId).remove(), ROOT); await p.waitForTimeout(200);
    return { instance: await p.evaluate((k) => !!(window[k] && window[k].instance), KEY) };
  });
  await run('pagehide', page(INLINE), async (p) => {
    await p.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false }))); await p.waitForTimeout(100);
    return { app: await p.evaluate((k) => typeof window[k], KEY), init: await p.evaluate(() => document.querySelectorAll('[data-lac-init]').length) };
  });
  // no IntersectionObserver: as in the source, no index item is marked
  await run('no IntersectionObserver', page(INLINE).replace('<head>', '<head><script>delete window.IntersectionObserver;</script>'), async (p) => (await state(p)).index);

  console.log(JSON.stringify(res, null, 1));
  console.log('errors', JSON.stringify(errors));
  await browser.close();
})();
