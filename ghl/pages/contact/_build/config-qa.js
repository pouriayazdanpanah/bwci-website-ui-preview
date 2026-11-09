// Dev-only QA for the port's configuration: GHL Custom Value substitution (modelled as GHL's text replacement of
// {{ custom_values.x }} in the pasted block), the hero image and logo (priority, fallbacks, no request when unset),
// the source props showVisitorOffice, showPam and showMap, link availability (the Start a Conversation page behind every "Start a
// Conversation" button, its four routes, the emails and phone, the page links), what the copy buttons copy once an email or phone is set,
// a hostile host with the script executed twice, a copied root mid-copy with a changed config, teardown, and a
// browser without the Clipboard API.
//   NODE_PATH=$(npm root -g) node config-qa.js <httpBase>      e.g. http://localhost:8123/
// (header, drawer, footer and re-render of the shared chrome: ghl/shared/site-chrome/qa/chrome-lifecycle.js)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const httpBase = (process.argv[2] || 'http://localhost:8123/').replace(/\/?$/, '/');
const PAGE = path.resolve(__dirname, '..');
const HOSTED = fs.readFileSync(path.join(PAGE, 'contact.ghl.html'), 'utf8');
const INLINE = fs.readFileSync(path.join(PAGE, 'contact.inline.ghl.html'), 'utf8');
const CFG_RE = /(<script type="application\/json" id="bwci-contact-config">)([\s\S]*?)(<\/script>)/;
const withCfg = (block, edit) => block.replace(CFG_RE, (m, a, json, c) => { const o = JSON.parse(json); edit(o); return a + '\n' + JSON.stringify(o, null, 2) + '\n' + c; });
const substitute = (block, value) => block.replace(/\{\{\s*custom_values\.([a-z0-9_]+)\s*\}\}/g, (m, name) => { const v = value(name); return v === undefined ? m : v; });
const HOSTILE_CSS = 'html{font-size:10px}body{margin:0;font-family:Georgia,serif;font-size:20px;line-height:1.1;color:#f00;letter-spacing:.2em}*{box-sizing:content-box}' +
  'h1,h2,h3{font-family:Impact;font-size:50px;color:purple;margin:30px 0;text-transform:uppercase}p{margin:0 0 2em;font-size:22px}a{color:orange;text-decoration:underline}' +
  'img{max-width:none!important;border:4px solid lime}ol,ul,li{list-style:disc;margin:20px;padding:20px}span{font-size:30px}address{font-style:italic;margin:30px}' +
  'button{margin:5px;padding:10px;border:2px solid blue;background:yellow;position:static}article{padding:30px;border:3px solid red}small,b,i{font-size:30px}section{padding:40px;background:#eee}div{line-height:2}.above{height:300px;background:#223}';
const page = (block, opts) => {
  const o = opts || {};
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
    (o.hostile ? '<style>' + HOSTILE_CSS + '</style>' : '<style>body{margin:0}</style>') + '</head><body>' +
    (o.hostile ? '<div class="above">above</div><section style="padding:0">' : '') + block + (o.hostile ? '</section><div class="above">below</div>' : '') +
    (o.twice ? '<script>' + block.slice(block.lastIndexOf('<script>') + 8, block.lastIndexOf('</script>')) + '</script>' : '') + '</body></html>';
};
const START = 'https://start.example.test/start-a-conversation';
const URLS = (name) => (name === 'bwci_img_logo' ? httpBase + 'ghl/shared/site-chrome/assets/bwci-logo.png' :
  name === 'bwci_img_contact_hero' ? httpBase + 'ghl/pages/contact/assets/contact-hero-hands.png' :
  name === 'bwci_url_start_a_conversation' ? START :
  name === 'bwci_url_contact_email' ? 'mailto:hello@example.test?subject=Enquiry' :
  name === 'bwci_url_contact_phone' ? 'tel:+44%2020%207946%200000' :
  name === 'bwci_url_media_email' ? 'mailto:press@example.test' :
  name === 'bwci_url_ir_email' ? 'mailto:ir@example.test' :
  /^bwci_url_/.test(name) ? '/' + name.slice(9).replace(/_/g, '-') + '?v=1' : undefined);

const STATE = () => {
  const r = document.getElementById('bwci-contact');
  const a = (sel) => [...r.querySelectorAll(sel)].map((x) => x.getAttribute('data-cnt-link') + '=' + x.getAttribute('href') + (x.getAttribute('aria-disabled') ? '(off)' : '')).join(' ');
  const img = (i) => (i.hidden ? 'hidden ' : '') + (i.complete && i.naturalWidth ? 'ok ' + i.naturalWidth : 'none') + (i.getAttribute('src') ? (i.src.startsWith('data:') ? ' data' : ' url') : ' nosrc');
  return {
    page: a('main a[data-cnt-link]'),
    header: a('header a[data-cnt-link="contact"]'),
    logo: img(r.querySelector('img[data-cnt-asset="logoImage"]')),
    hero: img(r.querySelector('img[data-cnt-asset="contactHeroImage"]')),
    raw: /\{\{|\}\}/.test([...r.querySelectorAll('a')].map((x) => x.getAttribute('href')).join('') + [...r.querySelectorAll('img')].map((x) => x.getAttribute('src') || '').join('')),
  };
};
const PROPS = () => {
  const r = document.getElementById('bwci-contact');
  const vis = (sel) => { const e = r.querySelector(sel); return e.hidden ? 'hidden' : 'shown ' + Math.round(e.getBoundingClientRect().height); };
  return { visitor: vis('[data-cnt-visitor]'), map: vis('[data-cnt-map]'), pam: vis('[data-cnt-pam]') };
};
const COPIED = () => {
  const r = document.getElementById('bwci-contact');
  return { btns: [...r.querySelectorAll('button[data-cnt-copy]')].map((b) => b.getAttribute('data-copied') + ':' + b.getAttribute('aria-label')).join(' | '), live: r.querySelector('[data-cnt-live]').textContent };
};

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const res = {};
  const run = async (name, html, fn, opts) => {
    const o = opts || {};
    const ctx = await browser.newContext({ viewport: o.viewport || { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => errors.push(name + ': ' + String(e)));
    p.on('console', (m) => { if (m.type() === 'error') errors.push(name + ' console: ' + m.text().slice(0, 140)); });
    const requests = [];
    p.on('request', (r) => requests.push(r.url()));
    await p.route(httpBase + 'variant.html', (r) => r.fulfill({ contentType: 'text/html; charset=utf-8', body: html }));
    await p.goto(httpBase + 'variant.html', { waitUntil: 'networkidle' });
    await p.waitForTimeout(400);
    res[name] = await fn(p, requests);
    await ctx.close();
  };
  const state = (p) => p.evaluate(STATE);
  const props = (p) => p.evaluate(PROPS);
  const copied = (p) => p.evaluate(COPIED);
  const imageRequests = (reqs) => reqs.filter((u) => /\.(png|jpe?g|webp)(\?|$)/.test(u)).length;
  const copyAll = async (p) => {
    const out = [];
    const btns = p.locator('button[data-cnt-copy]');
    for (let i = 0; i < await btns.count(); i++) {
      await btns.nth(i).scrollIntoViewIfNeeded(); await btns.nth(i).click(); await p.waitForTimeout(150);
      out.push(await p.evaluate(() => navigator.clipboard.readText()));
    }
    return out;
  };

  // Custom Values: literal (unsubstituted), '#', empty, configured, in both variants
  await run('hosted literal', page(HOSTED), async (p, reqs) => Object.assign(await state(p), { imageRequests: imageRequests(reqs) }));
  await run('inline literal', page(INLINE), (p) => state(p));
  await run('hosted all #', page(substitute(HOSTED, () => '#')), async (p, reqs) => Object.assign(await state(p), { imageRequests: imageRequests(reqs) }));
  await run('inline all #', page(substitute(INLINE, () => '#')), (p) => state(p));
  await run('inline empty', page(substitute(INLINE, () => '')), (p) => state(p));
  await run('hosted configured', page(substitute(HOSTED, URLS)), async (p, reqs) => Object.assign(await state(p), { imageRequests: imageRequests(reqs) }));
  await run('inline configured', page(substitute(INLINE, URLS)), (p) => state(p));
  // the copy buttons copy the source text while unset, and the configured address once set
  await run('copy unset', page(INLINE), (p) => copyAll(p));
  await run('copy configured', page(substitute(INLINE, URLS)), (p) => copyAll(p));
  await run('copy unusable values', page(substitute(INLINE, (n) => (n === 'bwci_url_contact_email' ? 'mailto:' : n === 'bwci_url_contact_phone' ? 'javascript:alert(1)' : n === 'bwci_url_media_email' ? 'https://example.test/press' : URLS(n)))), async (p) => ({ copied: await copyAll(p), links: (await state(p)).page }));
  await run('disabled click', page(HOSTED), async (p) => {
    const a = p.locator('main a[data-cnt-link="startAConversation"]').first();
    await a.click({ force: true }); await p.waitForTimeout(200);
    return { url: p.url().replace(httpBase, ''), title: await a.getAttribute('title') };
  });
  await run('enabled click (Start a Conversation, Banks route)', page(substitute(HOSTED, URLS)), async (p) => {
    await p.route(START, (r) => r.fulfill({ contentType: 'text/html', body: 'start' }));
    const a = p.locator('main a[data-cnt-link="startAConversationBanks"]');
    await a.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
    await Promise.all([p.waitForURL(START + '#banks'), a.click()]);
    return p.url();
  });

  // the source props: defaults, each flipped, and non-boolean values (which keep the default)
  await run('props default', page(INLINE), (p) => props(p));
  await run('props flipped', page(withCfg(INLINE, (c) => { c.showVisitorOffice = false; c.showPam = false; c.showMap = true; })), (p) => props(p));
  await run('props strings', page(withCfg(INLINE, (c) => { c.showVisitorOffice = 'false'; c.showPam = 'false'; c.showMap = 'true'; })), (p) => props(p));

  // a hostile host (generic CSS, content above and below, the script executed twice), desktop and phone
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    await run('hostile ' + w, page(withCfg(INLINE, (c) => { c.showMap = true; }), { hostile: true, twice: true }), async (p) => {
      const r = { owners: await p.evaluate(() => [document.querySelectorAll('[data-cnt-init]').length, Object.keys(window).filter((k) => /^__bwci/.test(k))]) };
      r.props = await props(p);
      r.copyButtons = await p.evaluate(() => [...document.querySelectorAll('#bwci-contact button[data-cnt-copy]')].map((b) => { const c = getComputedStyle(b); const r = b.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height) + ' ' + c.backgroundColor + ' ' + c.borderTopWidth; }).join(' | '));
      r.address = await p.evaluate(() => { const c = getComputedStyle(document.querySelector('#bwci-contact address')); return c.fontStyle + ' ' + c.margin + ' ' + c.fontSize; });
      await p.locator('button[data-cnt-copy="ge"]').scrollIntoViewIfNeeded(); await p.locator('button[data-cnt-copy="ge"]').click(); await p.waitForTimeout(200);
      r.copy = await copied(p);
      // the "Contact details" jump inside the host
      await p.evaluate(() => window.scrollTo(0, 0));
      await p.locator('#bwci-contact a[href="#cnt-details"]').click(); await p.waitForTimeout(1500);
      r.jump = await p.evaluate(() => Math.round(document.getElementById('cnt-details').getBoundingClientRect().top) + ' ' + location.hash);
      r.image = await p.evaluate(() => { const b = document.querySelector('#bwci-contact img[data-cnt-asset="contactHeroImage"]').getBoundingClientRect(); return Math.round(b.width) + 'x' + Math.round(b.height); });
      r.overflowX = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      return r;
    }, { viewport: { width: w, height: h } });
  }
  // a copied live root (GHL re-render) mid-copy, with a changed config
  await run('copied root', page(substitute(INLINE, URLS), { twice: true }), async (p) => {
    const r = {};
    await p.locator('button[data-cnt-copy="me"]').scrollIntoViewIfNeeded(); await p.locator('button[data-cnt-copy="me"]').click(); await p.waitForTimeout(200);
    r.before = await copied(p);
    await p.evaluate(() => {
      const cfgEl = document.getElementById('bwci-contact-config');
      const cfg = JSON.parse(cfgEl.textContent); cfg.showPam = false; cfg.showMap = true; cfg.links.startAConversation = '#'; cfg.links.mediaEmail = 'mailto:media@new.test';
      cfgEl.textContent = JSON.stringify(cfg);
      const old = document.getElementById('bwci-contact');
      old.replaceWith(old.cloneNode(true));
    });
    await p.waitForTimeout(300);
    r.afterCopy = Object.assign(await copied(p), await props(p));
    r.afterCopyLinks = await p.evaluate(() => [...document.querySelectorAll('#bwci-contact main a[data-cnt-link="startAConversation"], #bwci-contact a[data-cnt-link="mediaEmail"]')].map((a) => a.getAttribute('data-cnt-link') + '=' + a.getAttribute('href') + (a.getAttribute('aria-disabled') ? '(off)' : '')).join(' '));
    r.owner = await p.evaluate(() => { const a = window.__bwciContact; return !!a && a.instance && a.instance.root === document.getElementById('bwci-contact'); });
    // the old instance's timer does not touch the new root
    await p.waitForTimeout(1700);
    r.afterOldTimer = await copied(p);
    await p.locator('button[data-cnt-copy="me"]').click(); await p.waitForTimeout(150);
    r.copiesNew = await p.evaluate(() => navigator.clipboard.readText());
    return r;
  });
  // teardown mid-copy: removing the root leaves no instance, and the pending timer does nothing
  await run('teardown mid-copy', page(INLINE), async (p) => {
    await p.locator('button[data-cnt-copy="no"]').scrollIntoViewIfNeeded(); await p.locator('button[data-cnt-copy="no"]').click(); await p.waitForTimeout(100);
    await p.evaluate(() => { window.__kept = document.getElementById('bwci-contact'); window.__kept.remove(); }); await p.waitForTimeout(1800);
    return { instance: await p.evaluate(() => !!(window.__bwciContact && window.__bwciContact.instance)), detachedState: await p.evaluate(() => window.__kept.querySelector('button[data-cnt-copy="no"]').getAttribute('data-copied')) };
  });
  await run('pagehide', page(INLINE), async (p) => {
    await p.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false }))); await p.waitForTimeout(100);
    return { app: await p.evaluate(() => typeof window.__bwciContact), init: await p.evaluate(() => document.querySelectorAll('[data-cnt-init]').length) };
  });
  // no Clipboard API: the button still shows its tick, as in the source
  await run('no clipboard', page(INLINE).replace('<head>', '<head><script>Object.defineProperty(navigator, "clipboard", { value: undefined });</script>'), async (p) => {
    await p.locator('button[data-cnt-copy="gp"]').scrollIntoViewIfNeeded(); await p.locator('button[data-cnt-copy="gp"]').click(); await p.waitForTimeout(150);
    return copied(p);
  });
  await run('no IntersectionObserver', page(INLINE).replace('<head>', '<head><script>delete window.IntersectionObserver;</script>'), async (p) => Object.assign(await props(p), { hidden: await p.evaluate(() => [...document.querySelectorAll('#bwci-contact main *')].filter((e) => getComputedStyle(e).opacity === '0').length) }));

  console.log(JSON.stringify(res, null, 1));
  console.log('errors', JSON.stringify(errors));
  await browser.close();
})();
