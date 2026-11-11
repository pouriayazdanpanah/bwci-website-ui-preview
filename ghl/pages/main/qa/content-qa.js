// Dev-only QA for the 11 November 2026 content update (the owner's live Home markup + "Why now, why us"):
//   NODE_PATH=$(npm root -g) node content-qa.js <httpBase>      e.g. http://localhost:8123/
// - Platforms: each status tab re-renders the owner's cards (badge, name, description), the counts, the summary,
//   and keeps the owner's bw-platform-copy class; returning to "All" gives back the static markup's cards.
// - bw-copy-desktop / bw-copy-mobile: which copy is shown at 1440 and 390.
// - Links: the new keys (profiles, Providence Asset Management, The Platform Today) with synthetic values, and the
//   header/footer "The Platform Today" link now that the #bwci-today section is gone.
// - showWhyFlags: default, false, and a non-boolean value.
// - No horizontal overflow and no script errors at 13 widths.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const httpBase = (process.argv[2] || 'http://localhost:8123/').replace(/\/?$/, '/');
const PAGE = path.resolve(__dirname, '..');
const INLINE = fs.readFileSync(path.join(PAGE, 'main.inline.ghl.html'), 'utf8');
const URLS = (name) => (/^bwci_url_/.test(name) ? '/' + name.slice(9).replace(/_/g, '-') + '?v=1' : undefined);
const substitute = (block, value) => block.replace(/\{\{\s*custom_values\.([a-z0-9_]+)\s*\}\}/g, (m, n) => { const v = value(n); return v === undefined ? m : v; });
const withCfg = (block, edit) => block.replace(/(<script type="application\/json" id="bwci-main-config">)([\s\S]*?)(<\/script>)/, (m, a, json, c) => { const o = JSON.parse(json); edit(o); return a + '\n' + JSON.stringify(o, null, 2) + '\n' + c; });
const page = (block) => '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0">' + block + '</body></html>';

(async () => {
  const browser = await chromium.launch();
  const res = {}; const errors = [];
  const run = async (name, html, fn, opts) => {
    const p = await browser.newPage(Object.assign({ viewport: { width: 1440, height: 900 } }, opts || {}));
    p.on('pageerror', (e) => errors.push(name + ': ' + String(e).slice(0, 140)));
    await p.route(httpBase + 'variant.html', (r) => r.fulfill({ contentType: 'text/html; charset=utf-8', body: html }));
    await p.goto(httpBase + 'variant.html', { waitUntil: 'networkidle' });
    await p.waitForTimeout(600);
    res[name] = await fn(p);
    await p.close();
  };
  const cards = (p) => p.evaluate(() => {
    const r = document.getElementById('bwci-main-page');
    const pfx = r.querySelector('.pfx');
    return {
      cls: pfx.className.replace(/ bw-in\b/, ''),
      tabs: [...r.querySelectorAll('[data-bw-pf]')].map((b) => b.textContent.replace(/\s+/g, ' ').trim() + (b.classList.contains('bw-on') ? '*' : '')).join(' / '),
      cards: [...r.querySelectorAll('.pc-grid > .pk')].map((a) => [a.className, a.querySelector('.bw-badge').textContent, a.querySelector('h3').textContent,
        getComputedStyle(a.querySelector('.pk-more')).display, a.querySelector('.pk-reg').textContent.slice(0, 30)].join(' | ')),
      sum: r.querySelector('.pfx-sum > div:first-child').textContent.replace(/\s+/g, ' ').trim(),
    };
  });
  await run('platforms', page(INLINE), async (p) => {
    const out = { load: await cards(p) };
    const html0 = await p.evaluate(() => document.querySelector('#bwci-main-page .pc-grid').textContent.replace(/\s+/g, ' ').trim());
    for (const k of ['op', 'dev', 'all']) {
      await p.locator('[data-bw-pf="' + k + '"]').click(); await p.waitForTimeout(400);
      out[k] = await cards(p);
    }
    out.allTextSameAsMarkup = html0 === await p.evaluate(() => document.querySelector('#bwci-main-page .pc-grid').textContent.replace(/\s+/g, ' ').trim());
    return out;
  });
  for (const w of [1440, 390]) {
    await run('copy ' + w, page(INLINE), (p) => p.evaluate(() => [...document.querySelectorAll('#bwci-main-page .bw-copy-desktop, #bwci-main-page .bw-copy-mobile')]
      .map((e) => e.className.replace('bw-copy-', '') + ':' + (getComputedStyle(e).display === 'none' ? 'hidden' : 'shown')).join(' ')), { viewport: { width: w, height: 900 } });
  }
  await run('links configured', page(substitute(INLINE, URLS)), (p) => p.evaluate(() => {
    const r = document.getElementById('bwci-main-page');
    const pick = (k) => [...r.querySelectorAll('a[data-bw-link="' + k + '"]')].map((a) => a.getAttribute('href')).join(' ');
    return { platformToday: pick('platformToday'), today: pick('today'), pam: pick('providenceAssetManagement'), alexander: pick('profileAlexanderAlegriaSaif'),
      farhad: pick('profileFarhadReyazat'), gabriella: pick('profileGabriellaKarlova'), governancePerimeter: pick('governancePerimeter'), todayTarget: !!document.getElementById('bwci-today') };
  }));
  await run('links unset', page(INLINE), (p) => p.evaluate(() => [...document.querySelectorAll('#bwci-main-page #bwci-why a, #bwci-main-page .ld-p')].map((a) => a.getAttribute('data-bw-link') + '=' + a.getAttribute('href') + (a.getAttribute('aria-disabled') ? '(off)' : '')).join(' ')));
  const flags = (p) => p.evaluate(() => [...document.querySelectorAll('[data-bw-why-flag]')].map((e) => (e.hidden ? 'hidden' : 'shown')).join(','));
  await run('whyFlags default', page(INLINE), flags);
  await run('whyFlags false', page(withCfg(INLINE, (c) => { c.showWhyFlags = false; })), flags);
  await run('whyFlags "false"', page(withCfg(INLINE, (c) => { c.showWhyFlags = 'false'; })), flags);
  const ov = [];
  for (const w of [320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920, 2560]) {
    await run('w' + w, page(INLINE), async (p) => { const o = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); if (o > 0) ov.push(w + ':' + o); return o; }, { viewport: { width: w, height: 900 } });
  }
  console.log(JSON.stringify(res, null, 1));
  console.log('overflow', JSON.stringify(ov), 'errors', JSON.stringify(errors));
  await browser.close();
})();
