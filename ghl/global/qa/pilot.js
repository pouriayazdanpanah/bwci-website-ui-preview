#!/usr/bin/env node
// Dev-only QA for the global header/footer pilot. Compares, in headless Chromium with the real web fonts:
//   A) today's page block (header + page + footer in one Custom Code element), and
//   B) the global header block + the page's --global block + the global footer block, each in its own section,
// inside a GoHighLevel-like page (section > row > column > custom-code wrappers). GHL's Custom Value substitution is
// modelled as text replacement (links → test URLs; image values left literal, so inline blocks use their fallbacks).
//   NODE_PATH=$(npm root -g) node ghl/global/qa/pilot.js <outDir>
// Checks: pixel equality of the viewport at 13 widths × 5 scroll positions; dropdown, keyboard and drawer states
// (pixels + attributes); current-page marking; sticky GovNav and anchor offsets; content above the header; a hostile
// host (generic CSS, every GHL section layered with z-index:1); console errors; re-execution and teardown.
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');

const REPO = path.resolve(__dirname, '../../..');
const OUT = path.resolve(process.argv[2] || '/tmp/bwci-global-pilot');
fs.mkdirSync(OUT, { recursive: true });
const WIDTHS = process.env.WIDTHS ? process.env.WIDTHS.split(',').map(Number) : [320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920, 2560];
const HOSTILE_CSS = 'html{font-size:10px}body{margin:0;font-family:Georgia,serif;font-size:20px;line-height:1.1;color:#f00;letter-spacing:.2em}*{box-sizing:content-box}' +
  'h1,h2,h3{font-family:Impact;font-size:50px;color:purple;margin:30px 0;text-transform:uppercase}p{margin:0 0 2em;font-size:22px}a{color:orange;text-decoration:underline}' +
  'img{max-width:none!important;border:4px solid lime}ol,ul,li{list-style:disc;margin:20px;padding:20px}span{font-size:30px}address{font-style:italic;margin:30px}' +
  'button{margin:5px;padding:10px;border:2px solid blue;background:yellow;position:static}article{padding:30px;border:3px solid red}small,b,i{font-size:30px}div{line-height:2}' +
  // every GoHighLevel section layered: later sections would paint over a fixed header in an unlifted section
  '.c-section{position:relative;z-index:1;padding:0!important;background:#eee}.above{height:300px;background:#223}';

const rd = (p) => fs.readFileSync(path.join(REPO, p), 'utf8');
const sub = (s) => s.replace(/\{\{\s*custom_values\.([a-z0-9_]+)\s*\}\}/g, (m, k) => (/^bwci_img_|^hero_image$/.test(k) ? m : 'https://site.test/' + k));
const section = (block) => '<section class="c-section"><div class="inner"><div class="c-row"><div class="c-column"><div class="c-custom-code">' + block + '</div></div></div></div></section>';
function host(blocks, o) {
  o = o || {};
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>' +
    (o.hostile ? HOSTILE_CSS : 'body{margin:0}') + '</style></head><body><div class="hl_page-preview--content">' +
    (o.above ? '<section class="c-section"><div class="above">GoHighLevel content above</div></section>' : '') +
    blocks.map((b) => section(sub(b))).join('') +
    (o.below ? '<section class="c-section"><div class="above">GoHighLevel content below</div></section>' : '') + '</div></body></html>';
}
const PAGES = {
  contact: { original: 'ghl/pages/contact/contact.inline.ghl.html', global: 'ghl/pages/contact/contact.global.inline.ghl.html', root: 'bwci-contact', prefix: 'cnt' },
  governance: { original: 'ghl/pages/governance/governance.inline.ghl.html', global: 'ghl/pages/governance/governance.global.ghl.html', root: 'bwci-governance', prefix: 'gov' },
};
const HEADER = rd('ghl/global/site-header.inline.ghl.html');
const FOOTER = rd('ghl/global/site-footer.inline.ghl.html');
function write(name, html) { const f = path.join(OUT, name + '.html'); fs.writeFileSync(f, html); return 'file://' + f; }
function variants(slug, o) {
  const p = PAGES[slug];
  return {
    A: write(slug + (o && o.tag || '') + '-A', host([rd(p.original)], o)),
    B: write(slug + (o && o.tag || '') + '-B', host([HEADER, rd(p.global), FOOTER], o)),
  };
}

// pixel comparison through Python (numpy + Pillow): number of differing pixels
const PY = 'import sys,numpy as n\nfrom PIL import Image\na=n.asarray(Image.open(sys.argv[1]).convert("RGB")).astype(int);b=n.asarray(Image.open(sys.argv[2]).convert("RGB")).astype(int)\n' +
  'print(-1 if a.shape!=b.shape else int((n.abs(a-b).sum(axis=2)>0).sum()), 0 if a.shape!=b.shape else int(n.abs(a-b).max()), a.shape[0]*a.shape[1])';
// Pixel rule: identical, or anti-aliasing only. Chromium's text rasterisation varies slightly between page loads of
// the SAME file in a long session (measured B vs B, identical geometry), so a difference below 0.2 % of the viewport
// passes as "anti-aliasing only" — and only together with an identical layout of every page, header and footer element
// (geometry() below). Results count the two cases separately.
const AA_LIMIT = 0.002;
const pixelStats = (a, b) => { const [n, max, total] = execFileSync('python3', ['-c', PY, a, b]).toString().trim().split(' ').map(Number); return { n, max, aaOnly: n > 0 && n <= total * AA_LIMIT }; };
const diffPx = (a, b) => { const st = pixelStats(a, b); return st.n === 0 || st.aaOnly ? 0 : st.n; };
// layout of every rendered element of the page content, the header and the footer (A: in the page block; B: in the
// three blocks), so a pass never hides a layout change
async function geometry(page, rootId, p) {
  return page.evaluate(([rootId, p]) => {
    // the invisible 1x1 link status for screen readers sits at its block's top, which is the page block in both
    // variants but no longer includes the header in B: not part of the visible layout
    const rects = (sel) => [...document.querySelectorAll(sel)].filter((e) => e.getClientRects().length && !/-link-status$/.test(e.className)).map((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y + scrollY, r.width, r.height].map((v) => +v.toFixed(2)).join(); }).join(';');
    return { page: rects('#' + rootId + ' > :not([data-' + p + '-hdr-host]):not([data-' + p + '-footer]) *, #' + rootId + ' > :not([data-' + p + '-hdr-host]):not([data-' + p + '-footer])'),
      header: rects('[data-' + (document.getElementById('bwci-site-header') ? 'bwh' : p) + '-hdr] *'), footer: rects('[data-' + (document.getElementById('bwci-site-footer') ? 'bwf' : p) + '-footer] *') };
  }, [rootId, p]);
}
const aaNotes = [];
const noteAA = (label, a, b) => { const st = pixelStats(a, b); if (st.aaOnly) aaNotes.push(label + ': ' + st.n + ' px, max channel difference ' + st.max); };

// Web fonts: each Google Fonts response is fetched once and then served from a disk cache, so every load of every
// variant gets the same font files (a failed or slow download had rendered one load with a fallback font)
const FONT_CACHE = path.join(OUT, 'font-cache');
fs.mkdirSync(FONT_CACHE, { recursive: true });
const crypto = require('crypto');
async function fontRoute(route) {
  const url = route.request().url();
  const f = path.join(FONT_CACHE, crypto.createHash('sha1').update(url).digest('hex'));
  if (fs.existsSync(f + '.body')) {
    const meta = JSON.parse(fs.readFileSync(f + '.json', 'utf8'));
    return route.fulfill({ status: 200, headers: meta, body: fs.readFileSync(f + '.body') });
  }
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const resp = await route.fetch();
      if (resp.status() !== 200) throw new Error('HTTP ' + resp.status());
      const body = await resp.body();
      const headers = { 'content-type': resp.headers()['content-type'] || '', 'access-control-allow-origin': '*' };
      fs.writeFileSync(f + '.body', body); fs.writeFileSync(f + '.json', JSON.stringify(headers));
      return route.fulfill({ status: 200, headers, body });
    } catch (err) { if (attempt === 3) return route.abort(); }
  }
}

const results = { pixels: [], checks: [], errors: [] };
let failures = 0;
function check(name, ok, detail) { results.checks.push({ name, ok: !!ok, detail }); if (!ok) failures++; console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '  ' + JSON.stringify(detail) : '')); }

(async () => {
  const browser = await chromium.launch();
  async function open(url, w, h, opts) {
    // reduced motion stops the Contact hero's endless drift (and shortens fades), so two runs are pixel-comparable;
    // section 1b compares the header with motion on
    const ctx = await browser.newContext(Object.assign({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: 'reduce' }, opts || {}));
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|ERR_/.test(m.text())) errors.push(m.text()); });
    await page.route('**/*', (r) => (/^file:/.test(r.request().url()) ? r.continue() : /fonts\.(googleapis|gstatic)\.com/.test(r.request().url()) ? fontRoute(r) : r.abort()));
    await page.goto(url, { waitUntil: 'load' });
    // load EVERY declared font file (all weights and unicode subsets) before any screenshot: "fonts.ready" only covers
    // the files the current text has requested so far, and a late file (a weight or subset first needed after a
    // scroll or in a menu) made one load render with a fallback — measured as random pixel and geometry differences
    const notLoaded = await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.fonts].map((f) => f.load().catch(() => null))); await document.fonts.ready; return [...document.fonts].filter((f) => f.status !== 'loaded').map((f) => f.family + ' ' + f.weight + ' ' + f.style); });
    if (notLoaded.length) errors.push('fonts not loaded: ' + notLoaded.join(', '));
    await page.mouse.move(w - 1, h - 1);
    await page.waitForTimeout(3200); // hero entrance and the motion scans at 0.3 / 1.2 / 2.6 s
    return { ctx, page, errors };
  }
  async function shotAt(page, y, file) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(1300);
    await page.screenshot({ path: file });
  }
  async function scrollPositions(page) {
    return page.evaluate(() => { const H = document.documentElement.scrollHeight - innerHeight; return [0, 20, 120, Math.round(H / 2), H]; });
  }

  /* ---------- 1. pixels: 13 widths x 5 scroll positions, both pages ---------- */
  for (const slug of Object.keys(PAGES)) {
    const v = variants(slug);
    for (const w of WIDTHS) {
      // one variant open at a time: with both pages alive in the same browser, Chromium's text rasterisation can differ
      // between them (measured: the same files are identical when loaded one after the other)
      const shots = {};
      let ys = null;
      for (const k of ['A', 'B']) {
        const o = await open(v[k], w, 900);
        const pos = await scrollPositions(o.page);
        if (!ys) ys = pos;
        shots[k] = { height: pos[4], files: [], geo: await geometry(o.page, PAGES[slug].root, PAGES[slug].prefix) };
        for (let i = 0; i < ys.length; i++) { const f = path.join(OUT, slug + '-' + w + '-' + i + '-' + k + '.png'); await shotAt(o.page, ys[i], f); shots[k].files.push(f); }
        results.errors.push(...o.errors.map((e) => slug + ' ' + k + ' ' + w + ': ' + e));
        await o.ctx.close();
      }
      check(slug + ' ' + w + ' same document height', shots.A.height === shots.B.height, [shots.A.height, shots.B.height]);
      const ga = shots.A.geo, gb = shots.B.geo;
      check(slug + ' ' + w + ' same layout of every page, header and footer element', ga.page === gb.page && ga.header === gb.header && ga.footer === gb.footer, { page: ga.page === gb.page, header: ga.header === gb.header, footer: ga.footer === gb.footer });
      for (let i = 0; i < ys.length; i++) {
        const fa = shots.A.files[i], fb = shots.B.files[i];
        noteAA(slug + ' ' + w + ' y=' + ys[i], fa, fb);
        const d = diffPx(fa, fb);
        results.pixels.push({ slug, w, y: ys[i], diff: d });
        if (d !== 0) { failures++; console.log('FAIL pixels ' + slug + ' ' + w + ' y=' + ys[i] + ' diff=' + d); }
        else { fs.unlinkSync(fa); fs.unlinkSync(fb); }
      }
    }
    const n = results.pixels.filter((p) => p.slug === slug), bad = n.filter((p) => p.diff !== 0);
    console.log((bad.length ? 'FAIL ' : 'PASS ') + slug + ' pixels: ' + (n.length - bad.length) + '/' + n.length + ' viewports identical');
  }

  /* ---------- 1b. motion on: the header area at the top of the page (opaque, before it turns translucent) ---------- */
  for (const slug of Object.keys(PAGES)) {
    const v = variants(slug);
    for (const w of [390, 1024, 1440]) {
      const a = await open(v.A, w, 900, { reducedMotion: 'no-preference' }), b = await open(v.B, w, 900, { reducedMotion: 'no-preference' });
      const navH = await b.page.evaluate(() => parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10));
      const fa = path.join(OUT, slug + '-motion-' + w + '-A.png'), fb = path.join(OUT, slug + '-motion-' + w + '-B.png');
      await a.page.screenshot({ path: fa, clip: { x: 0, y: 0, width: w, height: navH } }); await b.page.screenshot({ path: fb, clip: { x: 0, y: 0, width: w, height: navH } });
      noteAA(slug + ' ' + w + ' motion on, header', fa, fb);
      const d = diffPx(fa, fb);
      check(slug + ' ' + w + ' motion on: header area identical (' + navH + ' px)', d === 0, d);
      if (d === 0) { fs.unlinkSync(fa); fs.unlinkSync(fb); }
      results.errors.push(...a.errors, ...b.errors);
      await a.ctx.close(); await b.ctx.close();
    }
  }

  /* ---------- 2. header states: attributes and pixels ---------- */
  const HDR = (p) => '[data-' + p + '-hdr]';
  async function headerState(page, p) {
    return page.evaluate((sel) => [...document.querySelectorAll(sel + ' a, ' + sel + ' button, ' + sel + ' [data-' + sel.slice(6, 9) + '-acc-panel]')].map((el) =>
      [el.textContent.replace(/\s+/g, ' ').trim().slice(0, 40), el.getAttribute('aria-current'), el.getAttribute('aria-expanded'), el.hidden, el.getAttribute('href')]), HDR(p));
  }
  for (const slug of Object.keys(PAGES)) {
    const v = variants(slug), P = PAGES[slug].prefix;
    for (const w of [1440, 390]) {
      const a = await open(v.A, w, 900), b = await open(v.B, w, 900);
      const sa = await headerState(a.page, P), sb = await headerState(b.page, 'bwh');
      check(slug + ' ' + w + ' header links: same text, current-page marks, expanded states and hrefs', JSON.stringify(sa) === JSON.stringify(sb), sa.filter((x, i) => JSON.stringify(x) !== JSON.stringify(sb[i])).slice(0, 3));
      const varsA = await a.page.evaluate((id) => { const s = getComputedStyle(document.getElementById(id)); return [s.getPropertyValue('--util-h'), s.getPropertyValue('--nav-h')]; }, PAGES[slug].root);
      const varsB = await b.page.evaluate((id) => { const s = getComputedStyle(document.getElementById(id)); return [s.getPropertyValue('--util-h'), s.getPropertyValue('--nav-h')]; }, PAGES[slug].root);
      check(slug + ' ' + w + ' page sees the same --util-h / --nav-h', JSON.stringify(varsA) === JSON.stringify(varsB), [varsA, varsB]);
      async function both(name, act) {
        await act(a.page, P); await act(b.page, 'bwh');
        await a.page.waitForTimeout(600); await b.page.waitForTimeout(600);
        const fa = path.join(OUT, slug + '-' + w + '-' + name + '-A.png'), fb = path.join(OUT, slug + '-' + w + '-' + name + '-B.png');
        await a.page.screenshot({ path: fa }); await b.page.screenshot({ path: fb });
        noteAA(slug + ' ' + w + ' ' + name, fa, fb);
        const d = diffPx(fa, fb);
        const st = [await headerState(a.page, P), await headerState(b.page, 'bwh')];
        const sameState = JSON.stringify(st[0]) === JSON.stringify(st[1]);
        const extra = await Promise.all([a.page, b.page].map((pg) => pg.evaluate(() => [document.body.style.overflow, document.activeElement && document.activeElement.textContent.replace(/\s+/g, ' ').trim().slice(0, 30)])));
        // the drawer's icons sit on half pixels (as designed); the fixed header is its own compositing layer, so their
        // anti-aliasing may differ by a few dozen pixels. Geometry must still be identical.
        const geo = await Promise.all([[a.page, P], [b.page, 'bwh']].map(([pg, p]) => pg.evaluate((p) => [...document.querySelectorAll('[data-' + p + '-hdr] *')].filter((e) => e.getClientRects().length).map((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].join(); }).join(';'), p)));
        const tol = /drawer/.test(name) ? 200 : 0;
        check(slug + ' ' + w + ' ' + name + ': same geometry, states, focus and body overflow; pixels ' + (tol ? '≤ ' + tol + ' anti-aliased' : 'identical'), d <= tol && geo[0] === geo[1] && sameState && JSON.stringify(extra[0]) === JSON.stringify(extra[1]), { diff: d, sameGeometry: geo[0] === geo[1], sameState, a: extra[0], b: extra[1] });
        if (d === 0) { fs.unlinkSync(fa); fs.unlinkSync(fb); }
      }
      if (w === 1440) {
        await both('dropdown hover', async (pg, p) => { const t = pg.locator('[data-' + p + '-dd-btn]').first(); await t.hover(); });
        await both('dropdown keyboard ArrowDown', async (pg, p) => { await pg.mouse.move(w - 1, 899); await pg.waitForTimeout(400); const t = pg.locator('[data-' + p + '-dd-btn]').nth(1); await t.focus(); await pg.keyboard.press('ArrowDown'); });
        await both('dropdown Escape', async (pg) => { await pg.keyboard.press('Escape'); });
        await both('stuck after scroll', async (pg) => { await pg.evaluate(() => window.scrollTo(0, 400)); await pg.waitForTimeout(800); });
        await both('dropdown over page content while stuck', async (pg, p) => { await pg.locator('[data-' + p + '-dd-btn]').last().click(); });
      } else {
        await both('drawer open', async (pg, p) => { await pg.locator('[data-' + p + '-menu-open]').click(); });
        await both('drawer Tab wraps', async (pg) => { for (let i = 0; i < 40; i++) await pg.keyboard.press('Tab'); });
        await both('drawer accordion toggle', async (pg, p) => { await pg.locator('[data-' + p + '-acc]').first().click(); });
        await both('drawer Escape', async (pg) => { await pg.keyboard.press('Escape'); });
        await both('drawer open while stuck', async (pg, p) => { await pg.evaluate(() => window.scrollTo(0, 900)); await pg.waitForTimeout(800); await pg.locator('[data-' + p + '-menu-open]').click(); });
        await both('drawer close button', async (pg, p) => { await pg.locator('[data-' + p + '-menu-x]').click(); });
      }
      results.errors.push(...a.errors, ...b.errors);
      await a.ctx.close(); await b.ctx.close();
    }
  }

  /* ---------- 3. GovNav sticky and anchor jumps (Governance), Contact details jump ---------- */
  for (const [slug, sel, w] of [['governance', '[data-gov-govnav] a[href="#gov-framework"]', 1440], ['governance', '[data-gov-govnav] select', 390], ['contact', 'a[href="#cnt-details"]', 1440], ['contact', 'a[href="#cnt-details"]', 390]]) {
    const v = variants(slug);
    const a = await open(v.A, w, 800), b = await open(v.B, w, 800);
    const r = [];
    for (const pg of [a.page, b.page]) {
      if (sel.endsWith('select')) await pg.selectOption(sel, '#gov-framework').catch(() => pg.evaluate(() => 0));
      else await pg.locator(sel).first().click();
      await pg.waitForTimeout(1500);
      r.push(await pg.evaluate((s) => {
        const id = s.endsWith('select') ? 'gov-framework' : /#([\w-]+)/.exec(s)[1];
        const gn = document.querySelector('[data-gov-govnav]');
        return { y: Math.round(scrollY), target: Math.round(document.getElementById(id).getBoundingClientRect().top), govnavTop: gn ? Math.round(gn.getBoundingClientRect().top) : null };
      }, sel));
    }
    check(slug + ' ' + w + ' in-page jump lands at the same place (scroll, target, sticky GovNav)', JSON.stringify(r[0]) === JSON.stringify(r[1]), r);
    await a.ctx.close(); await b.ctx.close();
  }

  /* ---------- 4. content above and below, and a hostile host ---------- */
  for (const o of [{ above: true, below: true, tag: '-around' }, { hostile: true, above: true, below: true, tag: '-hostile' }]) {
    for (const slug of Object.keys(PAGES)) {
      const v = variants(slug, o);
      for (const w of [1440, 390]) {
        const A = await open(v.A, w, 900);
        const ya = await scrollPositions(A.page);
        const geoA = await geometry(A.page, PAGES[slug].root, PAGES[slug].prefix);
        const Y = [0, 150, 320, 700, ya[3], ya[4]];
        for (const y of Y) await shotAt(A.page, y, path.join(OUT, slug + o.tag + '-' + w + '-' + y + '-A.png'));
        results.errors.push(...A.errors); await A.ctx.close();
        const b = await open(v.B, w, 900);
        const geoB = await geometry(b.page, PAGES[slug].root, PAGES[slug].prefix);
        check(slug + o.tag + ' ' + w + ' same layout of every page, header and footer element', JSON.stringify(geoA) === JSON.stringify(geoB));
        for (const y of Y) {
          const fa = path.join(OUT, slug + o.tag + '-' + w + '-' + y + '-A.png'), fb = path.join(OUT, slug + o.tag + '-' + w + '-' + y + '-B.png');
          await shotAt(b.page, y, fb);
          noteAA(slug + o.tag + ' ' + w + ' y=' + y, fa, fb);
          const d = diffPx(fa, fb);
          // B must keep the header on top even though every GoHighLevel section is layered
          const topEl = await b.page.evaluate(() => { const e = document.elementFromPoint(innerWidth / 2, 30); return !!(e && e.closest('#bwci-site-header')); });
          const hdrTop = await b.page.evaluate(() => Math.round(document.querySelector('[data-bwh-hdr-host]').getBoundingClientRect().top));
          const expectOnTop = y >= 300 + 40; // past the content above and the utility bar
          check(slug + o.tag + ' ' + w + ' y=' + y + ': same pixels' + (expectOnTop ? ', header on top' : ''), d === 0 && (!expectOnTop || topEl), { diff: d, topEl, hdrTop });
          if (d === 0) { fs.unlinkSync(fa); fs.unlinkSync(fb); }
        }
        results.errors.push(...b.errors); await b.ctx.close();
      }
    }
  }

  /* ---------- 5. lifecycle: re-execution, removal (restore), re-insertion, raised section ---------- */
  {
    const v = variants('governance', { hostile: true, tag: '-life' });
    const b = await open(v.B, 1440, 900);
    const pg = b.page;
    const runAgain = () => pg.evaluate(() => { const s = [...document.querySelectorAll('script:not([type])')].find((x) => x.textContent.includes("'bwci-site-header'")); const n = document.createElement('script'); n.textContent = s.textContent; document.body.appendChild(n); });
    const sectionZ = () => pg.evaluate(() => document.getElementById('bwci-site-header').closest('.c-section').style.zIndex);
    check('raiseSection lifts the layered header section', (await sectionZ()) === '999', await sectionZ());
    await runAgain(); await runAgain(); await pg.waitForTimeout(300);
    const owners = await pg.evaluate(() => [!!window.__bwciSiteHeader, document.querySelectorAll('#bwci-site-header .bwh-link-status').length, document.getElementById('bwci-site-header').classList.contains('bwh-fixed')]);
    check('header script executed three times: one owner, one status element, still pinned', owners[0] && owners[1] === 1 && owners[2], owners);
    await pg.evaluate(() => { window.scrollTo(0, 600); });
    await pg.waitForTimeout(400);
    await pg.locator('[data-bwh-dd-btn]').first().click();
    const saved = await pg.evaluate(() => { const el = document.getElementById('bwci-site-header'); window.__saved = el; el.remove(); return 1; });
    await pg.waitForTimeout(400);
    const after = await pg.evaluate(() => [document.documentElement.style.getPropertyValue('--nav-h'), document.querySelector('.c-section .inner .c-custom-code:empty') ? 'empty' : 'ok', document.body.style.overflow,
      [...document.querySelectorAll('.c-section')].map((s) => s.style.zIndex).join(',')]);
    check('header removed: <html> sizes and the raised section are restored', after[0] === '' && after[3] === ',,', after);
    await pg.mouse.move(1439, 899); // away from the menus: a pointer over a trigger re-opens it on hover, as on the page blocks
    await pg.evaluate(() => { document.querySelector('.c-section .c-custom-code').appendChild(window.__saved); });
    await pg.waitForTimeout(500);
    const back = await pg.evaluate(() => [document.documentElement.style.getPropertyValue('--nav-h'), document.getElementById('bwci-site-header').classList.contains('bwh-fixed'),
      document.querySelectorAll('[data-bwh-dd-panel]:not([hidden])').length, document.querySelector('[data-bwh-hdr-host]').style.top]);
    check('header re-inserted: re-initialised closed and pinned', back[0] !== '' && back[1] && back[2] === 0 && back[3] !== '', back);
    await pg.evaluate(() => { window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false })); });
    const gone = await pg.evaluate(() => [window.__bwciSiteHeader, document.documentElement.style.getPropertyValue('--nav-h'), document.getElementById('bwci-site-header').classList.contains('bwh-fixed')]);
    check('pagehide tears the header down', gone[0] === undefined && gone[1] === '' && !gone[2], gone);
    results.errors.push(...b.errors);
    await b.ctx.close();
  }

  /* ---------- 6. current page found when the page block arrives after the header ---------- */
  {
    // the Governance block itself, inserted (and its script run) 1.5 s after the page has loaded
    const gov = sub(rd(PAGES.governance.global));
    const html = host([HEADER, '<div id="late"></div>', FOOTER]).replace('</body>', '<script>window.__gov=' + JSON.stringify(gov).replace(/<\//g, '<\\/') + ';window.addEventListener("load",function(){setTimeout(function(){var d=document.getElementById("late");d.innerHTML=window.__gov;d.querySelectorAll("script").forEach(function(s){var n=document.createElement("script");if(s.type)n.type=s.type;n.textContent=s.textContent;s.replaceWith(n);});},1500);});</script></body>');
    const b = await open(write('late-marker', html), 1440, 900);
    const cur = await b.page.evaluate(() => [...document.querySelectorAll('#bwci-site-header [aria-current="page"]')].map((e) => e.textContent.trim()));
    check('current-page marker inserted after the header is applied', cur.length > 0, cur);
    await b.ctx.close();
  }

  await browser.close();
  results.errors = [...new Set(results.errors)];
  results.antiAliasingOnly = aaNotes;
  console.log('anti-aliasing-only differences (passed, layout identical): ' + aaNotes.length + (aaNotes.length ? '\n  ' + aaNotes.join('\n  ') : ''));
  check('no script errors in any run', results.errors.length === 0, results.errors.slice(0, 5));
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 1));
  console.log(failures ? 'FAILURES: ' + failures : 'ALL PASS');
  process.exit(failures ? 1 : 0);
})();
