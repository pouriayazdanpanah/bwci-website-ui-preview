#!/usr/bin/env node
// Dev-only QA for the global header/footer rollout: every page with a --global block (34 generated pages and Main)
// against today's page block. Same method as pilot.js (see qa/verification.md): variant A = today's inline block in one
// GoHighLevel-like section; B = global header + the page's .global.inline block + global footer, each in its own
// section; reduced motion; every font file loaded and served from a cache; one variant open at a time.
//   NODE_PATH=$(npm root -g) node ghl/global/qa/rollout.js <outDir> [shard] [shards] [slug,slug,...]
// Per page: layout + pixels at 7 widths x 4 scroll positions; content link targets; header state and the sizes the
// page sees; a dropdown (1440) and the drawer (390) opened over the page while stuck; a hostile host (generic CSS,
// every GHL section layered) with content above; the first in-page jump. Shard 0 also re-runs the header lifecycle.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');

const REPO = path.resolve(__dirname, '../../..');
const OUT = path.resolve(process.argv[2] || '/tmp/bwci-global-rollout');
const SHARD = Number(process.argv[3] || 0), SHARDS = Number(process.argv[4] || 1);
const ONLY = process.argv[5] ? process.argv[5].split(',') : null;
fs.mkdirSync(OUT, { recursive: true });
const WIDTHS = process.env.WIDTHS ? process.env.WIDTHS.split(',').map(Number) : [320, 390, 768, 1024, 1280, 1440, 1920];
const HOSTILE_CSS = 'html{font-size:10px}body{margin:0;font-family:Georgia,serif;font-size:20px;line-height:1.1;color:#f00;letter-spacing:.2em}*{box-sizing:content-box}' +
  'h1,h2,h3{font-family:Impact;font-size:50px;color:purple;margin:30px 0;text-transform:uppercase}p{margin:0 0 2em;font-size:22px}a{color:orange;text-decoration:underline}' +
  'img{max-width:none!important;border:4px solid lime}ol,ul,li{list-style:disc;margin:20px;padding:20px}span{font-size:30px}address{font-style:italic;margin:30px}' +
  'button{margin:5px;padding:10px;border:2px solid blue;background:yellow;position:static}article{padding:30px;border:3px solid red}small,b,i{font-size:30px}div{line-height:2}' +
  '.c-section{position:relative;z-index:1;padding:0!important}.above{height:300px;background:#223}';

const rd = (p) => fs.readFileSync(path.join(REPO, p), 'utf8');
const sub = (s) => s.replace(/\{\{\s*custom_values\.([a-z0-9_]+)\s*\}\}/g, (m, k) => (/^bwci_img_|^hero_image$/.test(k) ? m : 'https://site.test/' + k));
const section = (block) => '<section class="c-section"><div class="inner"><div class="c-row"><div class="c-column"><div class="c-custom-code">' + block + '</div></div></div></div></section>';
function host(blocks, o) {
  o = o || {};
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>' +
    (o.hostile ? HOSTILE_CSS : 'body{margin:0}') + '</style></head><body><div class="hl_page-preview--content">' +
    (o.above ? '<section class="c-section"><div class="above">GoHighLevel content above</div></section>' : '') +
    blocks.map((b) => section(sub(b))).join('') + '</div></body></html>';
}
const HEADER = rd('ghl/global/site-header.inline.ghl.html');
const FOOTER = rd('ghl/global/site-footer.inline.ghl.html');

// pages: every ghl/pages/<slug> with a .global.inline block
const PAGES = {};
for (const slug of fs.readdirSync(path.join(REPO, 'ghl/pages')).sort()) {
  const dir = 'ghl/pages/' + slug;
  const files = fs.readdirSync(path.join(REPO, dir));
  const g = files.find((f) => f.endsWith('.global.inline.ghl.html'));
  if (!g) continue;
  const o = files.find((f) => f.endsWith('.inline.ghl.html') && !f.includes('.global.'));
  const original = rd(dir + '/' + o);
  PAGES[slug] = { original: dir + '/' + o, global: dir + '/' + g,
    root: /<div id="(bwci-[a-z-]+)"/.exec(original)[1], prefix: /data-([a-z]+)-hdr-host/.exec(original)[1] };
}
// pages whose own CSS resizes the shared label class (.<prefix>-i, 14px !important at ≤767px, from the design's
// page-wide .sc-interp rules), which also shrinks today's header labels in the open phone drawer; the global header is
// not affected (recorded difference)
const LABEL_LEAK = new Set(['ecosystem', 'financial-engine', 'investors-partners', 'platforms', 'smes-projects']);
const SLUGS = Object.keys(PAGES).filter((s, i) => (ONLY ? ONLY.includes(s) : i % SHARDS === SHARD));

function write(name, html) { const f = path.join(OUT, name + '.html'); fs.writeFileSync(f, html); return 'file://' + f; }
function variants(slug, o) {
  const p = PAGES[slug], t = (o && o.tag) || '';
  return { A: write(slug + t + '-A', host([rd(p.original)], o)), B: write(slug + t + '-B', host([HEADER, rd(p.global), FOOTER], o)) };
}

// pixels: identical; or anti-aliasing only (< 0.2 % of the viewport, with an identical layout); or, on a page whose
// own CSS lacks a token the global header defines, a difference that stays inside the header (reported)
const PY = 'import sys,numpy as n\nfrom PIL import Image\na=n.asarray(Image.open(sys.argv[1]).convert("RGB")).astype(int);b=n.asarray(Image.open(sys.argv[2]).convert("RGB")).astype(int)\n' +
  'd=n.abs(a-b).max(axis=2) if a.shape==b.shape else None\n' +
  'ys,xs=(n.where(d>0) if d is not None else ([],[]))\n' +
  'print(-1 if d is None else int((d>0).sum()), 0 if d is None else int(d.max()), a.shape[0]*a.shape[1], *( [int(ys.min()),int(ys.max()),int(xs.min()),int(xs.max())] if len(ys) else [0,0,0,0]), 0 if d is None else int((d>2).sum()))';
const stats = (a, b) => { const v = execFileSync('python3', ['-c', PY, a, b]).toString().trim().split(' ').map(Number); return { n: v[0], max: v[1], total: v[2], box: v.slice(3, 7), n3: v[7] }; };

const FONT_CACHE = path.join(OUT, 'font-cache');
fs.mkdirSync(FONT_CACHE, { recursive: true });
async function fontRoute(route) {
  const url = route.request().url();
  const f = path.join(FONT_CACHE, crypto.createHash('sha1').update(url).digest('hex'));
  if (fs.existsSync(f + '.body')) return route.fulfill({ status: 200, headers: JSON.parse(fs.readFileSync(f + '.json', 'utf8')), body: fs.readFileSync(f + '.body') });
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

const results = { shard: SHARD, pages: SLUGS, checks: [], notes: [], errors: [] };
let failures = 0;
function check(name, ok, detail) { results.checks.push({ name, ok: !!ok, detail: detail === undefined ? null : detail }); if (!ok) failures++; console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined && !ok ? '  ' + JSON.stringify(detail).slice(0, 600) : '')); }

(async () => {
  const browser = await chromium.launch();
  async function open(url, w, h) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|ERR_/.test(m.text())) errors.push(m.text()); });
    await page.route('**/*', (r) => (/^file:/.test(r.request().url()) ? r.continue() : /fonts\.(googleapis|gstatic)\.com/.test(r.request().url()) ? fontRoute(r) : r.abort()));
    await page.goto(url, { waitUntil: 'load' });
    const notLoaded = await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.fonts].map((f) => f.load().catch(() => null))); await document.fonts.ready; return [...document.fonts].filter((f) => f.status !== 'loaded').map((f) => f.family + ' ' + f.weight); });
    if (notLoaded.length) errors.push('fonts not loaded: ' + notLoaded.join(', '));
    await page.mouse.move(w - 1, h - 1);
    await page.waitForTimeout(3200);
    return { ctx, page, errors };
  }
  async function shotAt(page, y, file) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(1300); await page.screenshot({ path: file }); }
  async function info(page, slug) {
    const P = PAGES[slug];
    return page.evaluate(([rootId, p]) => {
      const root = document.getElementById(rootId);
      // screen-reader status elements (1x1 or zero-height, role=status) sit at their block's top or end: not visible layout
      const visible = (e) => e.getClientRects().length && !/-(link-)?status$/.test(e.className) && e.getAttribute('role') !== 'status';
      const rects = (els) => els.filter(visible).map((e) => { const r = e.getBoundingClientRect(); return [r.x, r.y + scrollY, r.width, r.height].map((v) => +v.toFixed(2)).join(); }).join(';');
      const pageEls = [...root.children].filter((c) => !c.matches('[data-' + p + '-hdr-host], [data-' + p + '-footer]')).flatMap((c) => [c, ...c.querySelectorAll('*')]);
      const g = !!document.getElementById('bwci-site-header');
      const hp = g ? 'bwh' : p, fp = g ? 'bwf' : p;
      const cs = getComputedStyle(root);
      return {
        height: document.documentElement.scrollHeight,
        page: rects(pageEls),
        header: rects([...document.querySelectorAll('[data-' + hp + '-hdr] *')]),
        footer: rects([...document.querySelectorAll('[data-' + fp + '-footer] *')]),
        links: pageEls.filter((e) => e.matches('a[data-' + p + '-link]')).map((a) => a.getAttribute('href') + (a.getAttribute('aria-disabled') ? '(off)' : '')).join(' '),
        vars: [cs.getPropertyValue('--util-h').trim(), cs.getPropertyValue('--nav-h').trim()],
        tokens: { radiusFull: cs.getPropertyValue('--radius-full').trim(), floorSm: cs.getPropertyValue('--fs-floor-sm').trim() },
        headerState: [...document.querySelectorAll('[data-' + hp + '-hdr] a, [data-' + hp + '-hdr] button, [data-' + hp + '-acc-panel]')].map((e) =>
          [e.textContent.replace(/\s+/g, ' ').trim().slice(0, 40), e.getAttribute('aria-current'), e.getAttribute('aria-expanded'), e.hidden, e.getAttribute('href')].join('|')).join('\n'),
      };
    }, [P.root, P.prefix]);
  }
  const hdrBox = (page) => page.evaluate(() => { const els = [document.querySelector('[data-bwh-hdr-host]')]; const d = document.querySelector('[data-bwh-drawer]:not([hidden])'); if (d) els.push(d);
    const r = els.map((e) => e.getBoundingClientRect()); return [Math.min(...r.map((b) => b.top)), Math.max(...r.map((b) => b.bottom)), Math.min(...r.map((b) => b.left)), Math.max(...r.map((b) => b.right))]; });
  // compare two screenshots under the rule above
  function judge(label, fa, fb, sameLayout, tokenGap, box) {
    const st = stats(fa, fb);
    let verdict;
    if (st.n === 0) verdict = 'identical';
    else if (sameLayout && st.n > 0 && st.n <= st.total * 0.002) verdict = 'anti-aliasing';
    // shading off by 1-2/255 over an area (gradients, resampled images on another compositing layer); the pixels
    // off by more than 2/255 must still be fewer than 0.2 % of the viewport
    else if (sameLayout && st.n3 <= st.total * 0.002) verdict = 'imperceptible';
    else if (tokenGap && box && st.box[0] >= box[0] - 1 && st.box[1] <= box[1] + 1 && st.box[2] >= box[2] - 1 && st.box[3] <= box[3] + 1) verdict = 'token';
    else verdict = 'different';
    if (verdict !== 'identical') results.notes.push(label + ': ' + verdict + ' (' + st.n + ' px, max ' + st.max + ', box y' + st.box[0] + '-' + st.box[1] + ' x' + st.box[2] + '-' + st.box[3] + ')');
    if (verdict !== 'different') { fs.unlinkSync(fa); fs.unlinkSync(fb); }
    return verdict;
  }

  for (const slug of SLUGS) {
    const v = variants(slug), P = PAGES[slug];
    let tokenGap = false;
    /* 1. layout, links and pixels */
    for (const w of WIDTHS) {
      const shots = {}; let ys = null;
      for (const k of ['A', 'B']) {
        const o = await open(v[k], w, 900);
        const inf = await info(o.page, slug);
        if (!ys) { const H = inf.height - 900; ys = [0, 120, Math.round(H / 2), H]; }
        shots[k] = { inf, files: [] };
        shots[k].footTop = [];
        for (let i = 0; i < ys.length; i++) {
          const f = path.join(OUT, slug + '-' + w + '-' + i + '-' + k + '.png'); await shotAt(o.page, ys[i], f); shots[k].files.push(f);
          shots[k].footTop.push(await o.page.evaluate(() => { const e = document.querySelector('[data-bwf-footer], [data-bw-footer], footer'); return e ? Math.floor(e.getBoundingClientRect().top) : 1e9; }));
        }
        if (k === 'B') shots.B.box = await hdrBox(o.page);
        results.errors.push(...o.errors.map((e) => slug + ' ' + k + ' ' + w + ': ' + e));
        await o.ctx.close();
      }
      const a = shots.A.inf, b = shots.B.inf;
      tokenGap = !a.tokens.radiusFull || !a.tokens.floorSm;
      const sameLayout = a.height === b.height && a.page === b.page && a.header === b.header && a.footer === b.footer;
      // a page without the mobile type-floor tokens passes a smaller base size to today's footer: on such a page a
      // footer-only layout difference (page and header identical) is recorded as a token difference
      const footerToken = !sameLayout && tokenGap && a.page === b.page && a.header === b.header && a.links === b.links;
      if (footerToken) results.notes.push(slug + ' ' + w + ': token difference in the footer (document height ' + a.height + ' -> ' + b.height + ')');
      check(slug + ' ' + w + ' layout (height, page, header, footer) and content links' + (footerToken ? ' (footer: token difference)' : ''), (sameLayout || footerToken) && a.links === b.links,
        { height: [a.height, b.height], page: a.page === b.page, header: a.header === b.header, footer: a.footer === b.footer, links: a.links === b.links });
      const verdicts = ys.map((y, i) => judge(slug + ' ' + w + ' y=' + y, shots.A.files[i], shots.B.files[i], sameLayout, tokenGap, footerToken ? [Math.min(shots.A.footTop[i], shots.B.footTop[i]), 1e9, 0, 1e9] : null));
      // control: does today's block differ from ITSELF there (the page's own animation, e.g. Providence's world map)?
      for (let i = 0; i < ys.length; i++) {
        if (verdicts[i] !== 'different') continue;
        const o = await open(v.A, w, 900); const f2 = path.join(OUT, slug + '-' + w + '-' + i + '-A2.png'); await shotAt(o.page, ys[i], f2); await o.ctx.close();
        const self = stats(shots.A.files[i], f2), ab = stats(shots.A.files[i], shots.B.files[i]);
        const inside = (bx, by) => by[0] >= bx[0] - 2 && by[1] <= bx[1] + 2 && by[2] >= bx[2] - 2 && by[3] <= bx[3] + 2;
        if (self.n > 0 && inside(self.box, ab.box)) { verdicts[i] = 'page varies by itself'; results.notes.push(slug + ' ' + w + ' y=' + ys[i] + ': today\'s block differs from itself there (' + self.n + ' px); the A/B difference lies inside that area'); }
      }
      check(slug + ' ' + w + ' pixels at 4 scroll positions', verdicts.every((x) => x !== 'different'), verdicts);
      if (w === 1440 || w === 390) {
        // Main: today's header jumps to #bwci-today in-page; the global header links home + #bwci-today and turns it into
        // an in-page jump only on the real home address, which this local file is not
        const norm = (x) => (slug === 'main' ? x.replace(/\|https:\/\/site\.test\/bwci_url_home(#[\w-]+)$/, '|$1') : x);
        const la = a.headerState.split('\n'), lb = b.headerState.split('\n').map(norm);
        b.headerState = lb.join('\n');
        check(slug + ' ' + w + ' header state (current page, expanded, hrefs)', a.headerState === b.headerState, la.map((x, i) => (x === lb[i] ? null : 'A ' + x + ' | B ' + lb[i])).filter(Boolean).slice(0, 6));
        check(slug + ' ' + w + ' page sees the same --util-h / --nav-h', a.vars.join() === b.vars.join(), [a.vars, b.vars]);
      }
    }
    /* 2. menus open over the page while stuck */
    for (const [w, name, act] of [[1440, 'dropdown open over the page while stuck', (pg, p) => pg.locator('[data-' + p + '-dd-btn]').last().click()],
      [390, 'drawer open while stuck', (pg, p) => pg.locator('[data-' + p + '-menu-open]').click()]]) {
      const f = {};
      let box = null;
      for (const k of ['A', 'B']) {
        const o = await open(v[k], w, 900);
        await o.page.evaluate(() => window.scrollTo(0, Math.min(900, document.documentElement.scrollHeight - innerHeight)));
        await o.page.waitForTimeout(900);
        await act(o.page, k === 'A' ? P.prefix : 'bwh');
        await o.page.waitForTimeout(700);
        f[k] = path.join(OUT, slug + '-' + w + '-menu-' + k + '.png');
        await o.page.screenshot({ path: f[k] });
        if (k === 'B') box = await hdrBox(o.page);
        results.errors.push(...o.errors); await o.ctx.close();
      }
      const verdict = judge(slug + ' ' + w + ' ' + name, f.A, f.B, true, tokenGap || (w < 768 && LABEL_LEAK.has(slug)), box);
      // the drawer's half-pixel icons anti-alias differently on the fixed header's layer (pilot): 144 px
      check(slug + ' ' + w + ' ' + name, verdict !== 'different', verdict);
    }
    /* 3. hostile host with content above */
    const hv = variants(slug, { hostile: true, above: true, tag: '-hostile' });
    for (const w of [1440, 390]) {
      const A = await open(hv.A, w, 900);
      const ia = await info(A.page, slug);
      const H = ia.height - 900, Y = [0, 320, 700, H];
      const footA = [];
      for (const y of Y) { await shotAt(A.page, y, path.join(OUT, slug + '-hostile-' + w + '-' + y + '-A.png')); footA.push(await A.page.evaluate(() => { const e = document.querySelector('[data-bwf-footer], footer'); return e ? Math.floor(e.getBoundingClientRect().top) : 1e9; })); }
      results.errors.push(...A.errors); await A.ctx.close();
      const B = await open(hv.B, w, 900);
      const ib = await info(B.page, slug);
      const sameLayout = ia.height === ib.height && ia.page === ib.page && ia.header === ib.header && ia.footer === ib.footer;
      const footerToken = !sameLayout && tokenGap && ia.page === ib.page && ia.header === ib.header;
      const out = [];
      for (const [yi, y] of Y.entries()) {
        const fa = path.join(OUT, slug + '-hostile-' + w + '-' + y + '-A.png'), fb = path.join(OUT, slug + '-hostile-' + w + '-' + y + '-B.png');
        await shotAt(B.page, y, fb);
        const onTop = y >= 340 ? await B.page.evaluate(() => { const e = document.elementFromPoint(innerWidth / 2, 30); return !!(e && e.closest('#bwci-site-header')); }) : true;
        const footB = await B.page.evaluate(() => { const e = document.querySelector('[data-bwf-footer], footer'); return e ? Math.floor(e.getBoundingClientRect().top) : 1e9; });
        out.push([judge(slug + ' hostile ' + w + ' y=' + y, fa, fb, sameLayout, tokenGap, footerToken ? [Math.min(footA[yi], footB), 1e9, 0, 1e9] : null), onTop]);
      }
      check(slug + ' hostile ' + w + ': layout, pixels, header on top once stuck' + (footerToken ? ' (footer: token difference)' : ''), (sameLayout || footerToken) && out.every((x) => x[0] !== 'different' && x[1]), out);
      results.errors.push(...B.errors); await B.ctx.close();
    }
    /* 4. the first in-page jump of the page content */
    for (const w of [1440, 390]) {
      const r = [];
      for (const k of ['A', 'B']) {
        const o = await open(v[k], w, 800);
        r.push(await o.page.evaluate(async ([rootId, p]) => {
          const root = document.getElementById(rootId);
          const a = [...root.querySelectorAll('a[href^="#"]')].find((x) => x.getAttribute('href').length > 1 && !x.closest('[data-' + p + '-hdr-host], [data-' + p + '-footer]') &&
            document.getElementById(x.getAttribute('href').slice(1)) && x.getClientRects().length);
          if (!a) return 'none';
          const id = a.getAttribute('href').slice(1);
          a.click(); await new Promise((res) => setTimeout(res, 1500));
          return id + ' y=' + Math.round(scrollY) + ' target=' + Math.round(document.getElementById(id).getBoundingClientRect().top);
        }, [P.root, P.prefix]));
        results.errors.push(...o.errors); await o.ctx.close();
      }
      check(slug + ' ' + w + ' in-page jump lands at the same place', r[0] === r[1], r);
    }
  }

  /* 4b. The Platform Today's own overlays in a host that layers every GoHighLevel section */
  if (SLUGS.includes('platform-today')) {
    const hv = variants('platform-today', { hostile: true, tag: '-overlay' });
    const o = await open(hv.B, 1440, 900); const pg = o.page;
    await pg.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await pg.waitForTimeout(600);
    await pg.evaluate(() => { const st = document.querySelector('#bwci-platform-today [data-ptd-stages], #bwci-platform-today .ptd-st'); if (st) st.scrollIntoView({ block: 'center' }); });
    await pg.waitForTimeout(1200);
    const fabOk = await pg.evaluate(() => { const f = document.querySelector('[data-ptd-guide-open]'); if (!f || !f.classList.contains('ptd-gd-fab--on')) return 'not shown';
      const r = f.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!(e && f.contains(e)); });
    await pg.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await pg.waitForTimeout(800);
    const fabOverFooter = await pg.evaluate(() => { const f = document.querySelector('[data-ptd-guide-open]'); if (!f.classList.contains('ptd-gd-fab--on')) return 'not shown at the bottom';
      const r = f.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!(e && f.contains(e)); });
    check('platform-today layered host: "How to read" button visible (over the footer at the bottom)', fabOk === true && fabOverFooter === true, [fabOk, fabOverFooter]);
    if (fabOverFooter === true) {
      await pg.locator('[data-ptd-guide-open]').click(); await pg.waitForTimeout(800);
      const covered = await pg.evaluate(() => { const e = document.elementFromPoint(innerWidth / 2, 30); return !!(e && e.closest('[data-ptd-guide]')); });
      await pg.keyboard.press('Escape'); await pg.waitForTimeout(800);
      const back = await pg.evaluate(() => { const e = document.elementFromPoint(innerWidth / 2, 30); return !!(e && e.closest('#bwci-site-header')); });
      check('platform-today layered host: the open guide covers the header; closed, the header is on top again', covered && back, [covered, back]);
    }
    await pg.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false })));
    const z = await pg.evaluate(() => [...document.querySelectorAll('.c-section')].map((x) => x.style.zIndex).join(','));
    check('platform-today layered host: section layers restored on teardown', !/\d/.test(z), z);
    results.errors.push(...o.errors); await o.ctx.close();
  }

  /* 5. header lifecycle and the under-header marker (shard 0) */
  if ((SHARD === 0 && !ONLY) || process.env.LIFECYCLE) {
    const v = variants('main', { hostile: true, tag: '-life' });
    const b = await open(v.B, 1440, 900); const pg = b.page;
    check('Main marks data-bwci-under-header: transparent placeholder', await pg.evaluate(() => { const r = document.getElementById('bwci-site-header'); return r.classList.contains('bwh-under') && getComputedStyle(r).backgroundColor === 'rgba(0, 0, 0, 0)'; }));
    check('raiseSection lifts the layered header section', (await pg.evaluate(() => document.getElementById('bwci-site-header').closest('.c-section').style.zIndex)) === '999');
    const run = () => pg.evaluate(() => { const s = [...document.querySelectorAll('script:not([type])')].find((x) => x.textContent.includes("'bwci-site-header'")); const n = document.createElement('script'); n.textContent = s.textContent; document.body.appendChild(n); });
    await run(); await run(); await pg.waitForTimeout(300);
    check('header script executed three times: one owner, one status element, pinned', JSON.stringify(await pg.evaluate(() => [!!window.__bwciSiteHeader, document.querySelectorAll('#bwci-site-header .bwh-link-status').length, document.getElementById('bwci-site-header').classList.contains('bwh-fixed')])) === '[true,1,true]');
    const marksBefore = await pg.evaluate(() => document.querySelectorAll('#bwci-site-header [aria-current="page"]').length);
    await pg.evaluate(() => { const el = document.getElementById('bwci-site-header'); window.__saved = el; el.remove(); }); await pg.waitForTimeout(400);
    check('header removed: <html> sizes and raised section restored', JSON.stringify(await pg.evaluate(() => [document.documentElement.style.getPropertyValue('--nav-h'), document.querySelector('.c-section').style.zIndex])) === '["",""]');
    await pg.mouse.move(1439, 899);
    await pg.evaluate(() => { document.querySelector('.c-section .c-custom-code').appendChild(window.__saved); }); await pg.waitForTimeout(500);
    const back = await pg.evaluate(() => [document.getElementById('bwci-site-header').classList.contains('bwh-fixed'), document.getElementById('bwci-site-header').classList.contains('bwh-under'),
      document.querySelectorAll('[data-bwh-dd-panel]:not([hidden])').length, document.querySelectorAll('#bwci-site-header [aria-current="page"]').length]);
    // Main's SiteHeader current is "home", which no header item carries: the same (zero) marks as before
    check('header re-inserted: closed, pinned, under-header mark, same current-page marks as before', JSON.stringify(back) === JSON.stringify([true, true, 0, marksBefore]), [back, marksBefore]);
    await pg.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false })));
    check('pagehide tears the header down', JSON.stringify(await pg.evaluate(() => [window.__bwciSiteHeader === undefined, document.documentElement.style.getPropertyValue('--nav-h')])) === '[true,""]');
    results.errors.push(...b.errors); await b.ctx.close();
  }

  await browser.close();
  results.errors = [...new Set(results.errors)];
  check('no script errors and all fonts loaded', results.errors.length === 0, results.errors.slice(0, 5));
  fs.writeFileSync(path.join(OUT, 'results-' + SHARD + '.json'), JSON.stringify(results, null, 1));
  console.log('notes (passed unless a check above failed):\n  ' + results.notes.join('\n  '));
  console.log(failures ? 'FAILURES: ' + failures : 'ALL PASS');
  process.exit(failures ? 1 : 0);
})();
