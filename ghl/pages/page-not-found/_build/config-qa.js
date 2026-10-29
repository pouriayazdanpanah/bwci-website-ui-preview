// Dev-only QA for the port's configuration and GoHighLevel lifecycle: Custom Value substitution (modelled as GHL's
// text replacement of {{ custom_values.x }} in the pasted block), link availability, image priority / fallbacks,
// a hostile host (generic CSS, content above and below, the script executed twice), a re-render with a changed
// config, teardown and reduced motion. The page has no site header or footer, so the shared chrome suites
// (ghl/shared/site-chrome/qa/chrome-behaviour.js, chrome-lifecycle.js) do not apply; their relevant checks are here.
//   NODE_PATH=$(npm root -g) node config-qa.js <httpBase> [shotDir]      e.g. http://localhost:8123/ /tmp/nf-host
//   shotDir receives plain/w<width>.png and hostile/w<width>.png (the widget in each host) for diff.py
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const httpBase = (process.argv[2] || 'http://localhost:8123/').replace(/\/?$/, '/');
const shotDir = process.argv[3] || null;
const PAGE = path.resolve(__dirname, '..');
const HOSTED = fs.readFileSync(path.join(PAGE, 'page-not-found.ghl.html'), 'utf8');
const INLINE = fs.readFileSync(path.join(PAGE, 'page-not-found.inline.ghl.html'), 'utf8');
const CFG_RE = /(<script type="application\/json" id="bwci-page-not-found-config">)([\s\S]*?)(<\/script>)/;
const withCfg = (block, edit) => block.replace(CFG_RE, (m, a, json, c) => a + '\n' + (typeof edit === 'string' ? edit : JSON.stringify(edit(JSON.parse(json)), null, 2)) + '\n' + c);
const substitute = (block, value) => block.replace(/\{\{\s*custom_values\.([a-z0-9_]+)\s*\}\}/g, (m, name) => { const v = value(name); return v === undefined ? m : v; });
const HOSTILE_CSS = 'html{font-size:10px}body{margin:0;font-family:Georgia,serif;font-size:20px;line-height:1.1;color:#f00;text-align:center;letter-spacing:.2em}*{box-sizing:content-box}' +
  'h1,h2{font-family:Impact;font-size:50px;color:purple;margin:30px 0;text-transform:uppercase;line-height:1}p{margin:0 0 2em;font-size:22px;color:green}a{color:orange;text-decoration:underline}a:hover{color:red}' +
  'span{letter-spacing:1em}i{font-size:40px}img{border:5px solid lime;max-width:100%;height:auto;opacity:1}header,footer{background:#000;padding:30px}main{padding:20px;background:#eee;display:grid}' +
  'section{padding:40px;background:#eee}div{line-height:2}.above{height:300px;background:#223}';
const page = (block, opts) => {
  const o = opts || {};
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
    (o.hostile ? '<style>' + HOSTILE_CSS + '</style>' : '<style>body{margin:0}</style>') + '</head><body>' +
    (o.hostile ? '<div class="above">above</div><section style="padding:0">' : '') + block + (o.hostile ? '</section><div class="above">below</div>' : '') +
    (o.twice ? '<script>' + block.slice(block.lastIndexOf('<script>') + 8, block.lastIndexOf('</script>')) + '</script>' : '') + '</body></html>';
};
const ASSET = (f) => httpBase + 'ghl/pages/page-not-found/assets/' + f;
const URLS = (name) => (name === 'bwci_img_logo' ? httpBase + 'ghl/shared/site-chrome/assets/bwci-logo.png' : name === 'bwci_img_page_not_found_cone' ? ASSET('not-found-cone.png') :
  /^bwci_url_/.test(name) ? '/' + name.slice(9).replace(/_/g, '-') + '?v=1' : undefined);

const STATE = () => {
  const r = document.getElementById('bwci-page-not-found');
  const img = (i) => (i.hidden ? 'hidden ' : '') + (i.complete && i.naturalWidth ? 'ok ' + i.naturalWidth : 'none') + (i.getAttribute('src') ? (i.src.startsWith('data:') ? ' data' : ' url') : ' nosrc');
  return {
    links: [...r.querySelectorAll('a[data-nf-link]')].map((x) => x.getAttribute('data-nf-link') + '=' + x.getAttribute('href') + (x.getAttribute('aria-disabled') ? '(off)' : '')).join(' '),
    cone: img(r.querySelector('img[data-nf-asset="notFoundConeImage"]')),
    logo: img(r.querySelector('img[data-nf-asset="logoImage"]')),
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
    p.on('requestfailed', (r) => errors.push(name + ' failed: ' + r.url().slice(0, 100)));
    await p.route(httpBase + 'variant.html', (r) => r.fulfill({ contentType: 'text/html; charset=utf-8', body: html }));
    await p.goto(httpBase + 'variant.html', { waitUntil: 'networkidle' });
    await p.waitForTimeout(300);
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
  await run('absolute + odd values', page(withCfg(INLINE, (c) => Object.assign(c, { links: { home: ' https://example.com/?a=1#top ', contact: 'javascript:alert(1)' }, notFoundConeImage: 'REPLACE-WITH-URL' }))), (p) => state(p));
  await run('broken JSON', page(withCfg(INLINE, '{ not json')), (p) => state(p));
  await run('disabled click', page(HOSTED), async (p) => {
    await p.locator('a.nf-btn').click({ force: true });
    await p.waitForTimeout(200);
    return { url: p.url().replace(httpBase, ''), title: await p.locator('a.nf-btn').getAttribute('title'), status: await p.evaluate(() => document.querySelector('#bwci-page-not-found [role="status"]').textContent) };
  });
  await run('enabled click', page(substitute(HOSTED, URLS)), async (p) => {
    await p.route(httpBase + 'contact?v=1', (r) => r.fulfill({ contentType: 'text/html', body: 'contact' }));
    await Promise.all([p.waitForURL('**/contact?v=1'), p.locator('a.nf-ghost').click()]);
    return p.url().replace(httpBase, '');
  });

  // plain vs hostile host (generic CSS, content above and below, the script executed twice): the widget renders the
  // same, one owner, no overflow; one viewport-sized capture of the widget compared pixel for pixel
  for (const [w, h] of [[1440, 900], [390, 844], [320, 568]]) {
    for (const hostile of [false, true]) {
      await run((hostile ? 'hostile ' : 'plain ') + w, page(INLINE, { hostile, twice: hostile }), async (p) => {
        await p.evaluate(() => document.fonts.ready);
        const r = await p.evaluate(() => {
          const root = document.getElementById('bwci-page-not-found'); const m = root.querySelector('main');
          const st = (s) => { const cs = getComputedStyle(root.querySelector(s)); return [cs.fontFamily.slice(0, 18), cs.fontSize, cs.lineHeight, cs.letterSpacing, cs.color, cs.textTransform, cs.textDecorationLine, cs.marginTop, cs.borderTopWidth].join(' '); };
          return { owners: Object.keys(window).filter((k) => /^__bwci/.test(k)), inits: document.querySelectorAll('[data-nf-init]').length,
            overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth, mainH: Math.round(m.getBoundingClientRect().height), vh: innerHeight,
            styles: ['.nf-code', '.nf-title', '.nf-lead', '.nf-eyebrow', '.nf-rule', '.nf-btn', '.nf-ghost', '.nf-logo', '.nf-cone'].map(st) };
        });
        await p.evaluate(() => window.scrollTo(0, document.getElementById('bwci-page-not-found').getBoundingClientRect().top + scrollY));
        await p.evaluate(() => document.getAnimations().forEach((a) => a.finish && a.effect.getTiming().iterations !== Infinity ? a.finish() : (a.pause(), a.currentTime = 1200)));
        if (shotDir) { const d = path.join(shotDir, hostile ? 'hostile' : 'plain'); fs.mkdirSync(d, { recursive: true }); await p.screenshot({ path: path.join(d, 'w' + w + '.png') }); }
        return r;
      }, { viewport: { width: w, height: h } });
    }
  }
  // GHL re-render: the root replaced by a copy of the live markup, with a changed config
  await run('re-render with a changed config', page(substitute(INLINE, URLS), { twice: true }), async (p) => {
    const r = {};
    r.before = await state(p);
    await p.evaluate(() => {
      const cfgEl = document.getElementById('bwci-page-not-found-config');
      const cfg = JSON.parse(cfgEl.textContent); cfg.links.contact = '#'; cfg.links.home = '/new-home'; cfg.notFoundConeImage = '#';
      cfgEl.textContent = JSON.stringify(cfg);
      const old = document.getElementById('bwci-page-not-found'); old.replaceWith(old.cloneNode(true));
    });
    await p.waitForTimeout(300);
    r.after = await state(p);
    r.owner = await p.evaluate(() => { const a = window.__bwciPageNotFound; return !!a && a.instance && a.instance.root === document.getElementById('bwci-page-not-found'); });
    r.statusLines = await p.evaluate(() => document.querySelectorAll('#bwci-page-not-found [role="status"]').length);
    r.animations = await p.evaluate(() => document.getAnimations().length);
    return r;
  });
  // teardown: the root removed (GHL navigation / editor), then pagehide
  await run('teardown', page(INLINE), async (p) => {
    const r = {};
    await p.evaluate(() => document.getElementById('bwci-page-not-found').remove());
    await p.waitForTimeout(200);
    r.afterRemove = await p.evaluate(() => { const a = window.__bwciPageNotFound; return { app: !!a, instance: a ? a.instance : 'gone' }; });
    await p.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false })));
    r.afterPagehide = await p.evaluate(() => '__bwciPageNotFound' in window);
    return r;
  });
  await run('reduced motion', page(INLINE), (p) => p.evaluate(() => {
    const els = [...document.querySelectorAll('#bwci-page-not-found main *')];
    return { animations: document.getAnimations().length, invisible: els.filter((e) => getComputedStyle(e).opacity === '0').length,
      translated: els.filter((e) => /translate|matrix/.test(getComputedStyle(e).transform) && !e.classList.contains('nf-cone')).length,
      cone: getComputedStyle(document.querySelector('.nf-cone')).opacity };
  }), { reducedMotion: 'reduce' });

  console.log(JSON.stringify(res, null, 1));
  console.log('errors', JSON.stringify(errors));
  await browser.close();
})();
