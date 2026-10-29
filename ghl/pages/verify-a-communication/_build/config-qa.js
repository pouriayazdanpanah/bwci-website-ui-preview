// Dev-only QA for the port's configuration: GHL Custom Value substitution (modelled as GHL's text replacement of
// {{ custom_values.x }} in the pasted block), link availability, the logo value/fallback, the three source props,
// repeat execution and a copied root with a changed config.
//   NODE_PATH=$(npm root -g) node config-qa.js <httpBase>      e.g. http://localhost:8123/
// (header, drawer, footer and re-render of the shared chrome: ghl/shared/site-chrome/qa/chrome-lifecycle.js)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const httpBase = (process.argv[2] || 'http://localhost:8123/').replace(/\/?$/, '/');
const PAGE = path.resolve(__dirname, '..');
const HOSTED = fs.readFileSync(path.join(PAGE, 'verify-a-communication.ghl.html'), 'utf8');
const INLINE = fs.readFileSync(path.join(PAGE, 'verify-a-communication.inline.ghl.html'), 'utf8');
const CFG_RE = /(<script type="application\/json" id="bwci-verify-a-communication-config">)([\s\S]*?)(<\/script>)/;
const withCfg = (block, edit) => block.replace(CFG_RE, (m, a, json, c) => a + '\n' + JSON.stringify(edit(JSON.parse(json)), null, 2) + '\n' + c);
// GHL substitutes every merge field in the block's text; `value(name)` gives each field's value (undefined = left literal)
const substitute = (block, value) => block.replace(/\{\{\s*custom_values\.([a-z0-9_]+)\s*\}\}/g, (m, name) => { const v = value(name); return v === undefined ? m : v; });
const page = (block, twice, above) => '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0">' +
  (above ? '<div style="height:300px;background:#223"></div>' : '') + block +
  (twice ? '<script>' + block.slice(block.lastIndexOf('<script>') + 8, block.lastIndexOf('</script>')) + '</script>' : '') + '</body></html>';
const URLS = (name) => (name === 'bwci_img_logo' ? httpBase + 'ghl/shared/site-chrome/assets/bwci-logo.png' : /^bwci_url_/.test(name) ? '/' + name.slice(9).replace(/_/g, '-') + '?v=1' : undefined);

const STATE = () => {
  const r = document.getElementById('bwci-verify-a-communication');
  const vis = (el) => !!el && el.getClientRects().length > 0;
  const a = (sel) => [...r.querySelectorAll(sel)].map((x) => x.getAttribute('href') + (x.getAttribute('aria-disabled') ? '(off)' : ''));
  const logo = r.querySelector('img[data-vfc-asset="logoImage"]');
  return {
    page: a('main a[data-vfc-link]').join(' '),
    footerVerify: a('footer a').filter((h) => /verify/.test(h)).join(' '),
    current: [...r.querySelectorAll('header [aria-current="page"]')].map((x) => x.textContent.trim()).join(' / '),
    flags: [...r.querySelectorAll('[data-vfc-flag]')].filter(vis).length + '/' + r.querySelectorAll('[data-vfc-flag]').length,
    former: vis(r.querySelector('[data-vfc-former]')),
    alerts: vis(r.querySelector('[data-vfc-alerts]')),
    external: [...r.querySelectorAll('a[href^="http"], a[href^="mailto"]')].length,
    logo: (logo.complete && logo.naturalWidth ? 'ok ' : 'none ') + (logo.getAttribute('src') ? (logo.src.startsWith('data:') ? 'data' : 'url') : 'nosrc'),
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
  // the three source props, each against its default
  await run('props flipped', page(withCfg(substitute(INLINE, URLS), (c) => Object.assign(c, { showFlags: true, showFormerName: false, showAlerts: true }))), async (p) => {
    const s = await state(p);
    // the alerts section, now present, is scanned by the shared scroll motion like the source's
    await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } });
    await p.waitForTimeout(3500);
    return { flags: s.flags, former: s.former, alerts: s.alerts, stillHidden: await p.evaluate(() => document.querySelectorAll('[data-bw-rv="wait"]').length) };
  });
  await run('props non-boolean', page(withCfg(INLINE, (c) => Object.assign(c, { showFlags: 'yes', showFormerName: 0, showAlerts: null }))), async (p) => {
    const s = await state(p); return { flags: s.flags, former: s.former, alerts: s.alerts };
  });
  // repeat execution, content above, then a copied live root with a changed config (and a pressed Copy button)
  await run('duplicate + copied root', page(substitute(INLINE, URLS), true, true), async (p) => {
    const r = {};
    r.instances = await p.evaluate(() => [document.querySelectorAll('#bwci-verify-a-communication').length, Object.keys(window).filter((k) => /^__bwci/.test(k))]);
    await p.locator('[data-vfc-copy]').click(); await p.waitForTimeout(200);
    r.copiedBefore = await p.evaluate(() => document.querySelector('[data-vfc-copy]').getAttribute('data-done'));
    await p.evaluate(() => {
      const cfgEl = document.getElementById('bwci-verify-a-communication-config');
      const cfg = JSON.parse(cfgEl.textContent);
      cfg.links.contact = '#'; cfg.showFlags = true; cfg.showAlerts = true;
      cfgEl.textContent = JSON.stringify(cfg);
      const old = document.getElementById('bwci-verify-a-communication');
      old.replaceWith(old.cloneNode(true));
    });
    await p.waitForTimeout(500);
    r.afterCopy = await p.evaluate(() => {
      const root = document.getElementById('bwci-verify-a-communication');
      return { contact: [...root.querySelectorAll('a[data-vfc-link="contact"]')].map((a) => a.getAttribute('href') + (a.getAttribute('aria-disabled') ? '(off)' : '')).join(' '),
        flags: [...root.querySelectorAll('[data-vfc-flag]')].filter((e) => !e.hidden).length, alerts: !root.querySelector('[data-vfc-alerts]').hidden,
        copy: root.querySelector('[data-vfc-copy]').getAttribute('data-done') + ' ' + root.querySelector('[data-vfc-copy]').textContent.trim(),
        owner: window.__bwciVerifyACommunication && window.__bwciVerifyACommunication.root === root };
    });
    await p.locator('[data-vfc-copy]').click(); await p.waitForTimeout(200);
    r.copyWorksAfterCopy = await p.evaluate(() => document.querySelector('[data-vfc-copy]').getAttribute('data-done'));
    r.overflowX = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    return r;
  });
  // a pending Copy timer is cleared on teardown (no state change on a removed root)
  await run('teardown during copy', page(INLINE), async (p) => {
    await p.locator('[data-vfc-copy]').click(); await p.waitForTimeout(100);
    return p.evaluate(async () => {
      const old = document.getElementById('bwci-verify-a-communication');
      const btn = old.querySelector('[data-vfc-copy]');
      old.remove(); await new Promise((r) => setTimeout(r, 2200));
      return { removedRootStill: btn.getAttribute('data-done'), owner: !!window.__bwciVerifyACommunication && !!window.__bwciVerifyACommunication.instance };
    });
  });
  await run('disabled click', page(HOSTED), async (p) => {
    await p.locator('a[data-vfc-link="contact"]').first().click({ force: true });
    await p.waitForTimeout(200);
    return { url: p.url().replace(httpBase, ''), title: await p.locator('a[data-vfc-link="contact"]').first().getAttribute('title') };
  });

  console.log(JSON.stringify(res, null, 1));
  console.log('errors', JSON.stringify(errors));
  await browser.close();
})();
