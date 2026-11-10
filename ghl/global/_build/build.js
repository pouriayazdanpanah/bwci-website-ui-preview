#!/usr/bin/env node
// Dev-only build: assembles the GoHighLevel Custom Code blocks of the global site header and footer.
//   node ghl/global/_build/build.js
// Inputs : _build/src/{base.css,site-header.css,site-header.js,site-footer.js} and the shared site chrome
//          (ghl/shared/site-chrome: SiteHeader / SiteFooter markup, CSS and runtime, with the shared link/image resolvers)
// Outputs: site-header.ghl.html / site-footer.ghl.html (Custom Value image references only) and
//          site-header.inline.ghl.html / site-footer.inline.ghl.html (plus the original logo as imageFallbacks)
// Each block goes into ONE Custom Code element of a GoHighLevel Global Section; the page blocks built with --global
// carry no header or footer. Nothing in _build/ is needed at runtime.
//
// What it does beyond concatenation:
//   1. prefixes every CSS selector with the block's root id (":scope" = the root) and fails on any unscoped selector;
//   2. builds each block's link config from its markup and the shared link mapping (existing Custom Values only);
//   3. rejects Claude Design / local paths.
'use strict';
const fs = require('fs');
const path = require('path');
const siteChrome = require('../../shared/site-chrome/site-chrome');
const siteLinks = require('../../shared/site-links');

const OUT = path.resolve(__dirname, '..');
const SRC = path.join(__dirname, 'src');
const read = (f) => fs.readFileSync(path.join(SRC, f), 'utf8');

/* ---------------- CSS helpers (as the page builds) ---------------- */
function stripComments(css) {
  let out = '', i = 0, quote = null;
  while (i < css.length) {
    const c = css[i];
    if (quote) { out += c; if (c === '\\') { out += css[i + 1]; i += 2; continue; } if (c === quote) quote = null; i++; continue; }
    if (c === '"' || c === "'") { quote = c; out += c; i++; continue; }
    if (c === '/' && css[i + 1] === '*') { const end = css.indexOf('*/', i + 2); i = end === -1 ? css.length : end + 2; continue; }
    out += c; i++;
  }
  return out;
}
function scanTo(s, i, stops) {
  let depth = 0, quote = null;
  for (; i < s.length; i++) {
    const c = s[i];
    if (quote) { if (c === '\\') { i++; continue; } if (c === quote) quote = null; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (depth === 0 && stops.includes(c)) return i;
  }
  return -1;
}
function matchBrace(s, open) {
  let depth = 0, quote = null;
  for (let i = open; i < s.length; i++) {
    const c = s[i];
    if (quote) { if (c === '\\') { i++; continue; } if (c === quote) quote = null; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return i; }
  }
  throw new Error('Unbalanced braces near: ' + s.slice(open, open + 80));
}
function splitSelectors(sel) {
  const parts = []; let start = 0;
  for (;;) {
    const j = scanTo(sel, start, [',']);
    if (j === -1) { parts.push(sel.slice(start)); break; }
    parts.push(sel.slice(start, j)); start = j + 1;
  }
  return parts.map((p) => p.trim().replace(/\s+/g, ' ')).filter(Boolean);
}
function scopeCss(css, ROOT, kfPrefix) {
  const scopeSelector = (s) => (s.startsWith(':scope') ? ROOT + s.slice(6) : ROOT + ' ' + s);
  function block(src, indent) {
    let out = '', i = 0;
    while (i < src.length) {
      while (i < src.length && /\s/.test(src[i])) i++;
      if (i >= src.length) break;
      const open = scanTo(src, i, ['{']);
      if (open === -1) throw new Error('Dangling CSS: ' + src.slice(i, i + 80));
      const close = matchBrace(src, open);
      const prelude = src.slice(i, open).trim().replace(/\s+/g, ' ');
      const body = src.slice(open + 1, close);
      if (prelude.startsWith('@')) {
        if (/^@import/.test(prelude)) throw new Error('Do not use @import');
        if (/^@(-webkit-)?keyframes/.test(prelude)) {
          if (!prelude.split(' ')[1].startsWith(kfPrefix)) throw new Error('Keyframes must be ' + kfPrefix + ' namespaced: ' + prelude);
          out += indent + prelude + '{ ' + body.replace(/\s+/g, ' ').trim() + ' }\n';
        } else out += indent + prelude + '{\n' + block(body, indent + '  ') + indent + '}\n';
      } else {
        out += indent + splitSelectors(prelude).map(scopeSelector).join(', ') + '{ ' + body.replace(/\s+/g, ' ').trim() + ' }\n';
      }
      i = close + 1;
    }
    return out;
  }
  const scoped = block(stripComments(css), '');
  scoped.split('\n').forEach((line) => {
    const t = line.trim();
    if (!t || t === '}' || t.startsWith('@') || /^(from|to|\d+%)/.test(t)) return;
    splitSelectors(t.slice(0, t.indexOf('{'))).forEach((s) => { if (!s.startsWith(ROOT)) throw new Error('Unscoped selector: ' + s); });
  });
  return scoped;
}

// No font link: the header and footer use Plus Jakarta Sans 400–700, which every page block already loads. The page
// blocks request the font in three different ways (with/without italics and 800); a font link here would add a second
// set of @font-face rules and change which font file renders some pages' own text.
const dataUri = (file) => 'data:image/png;base64,' + fs.readFileSync(file).toString('base64');

function part(css, from, to) {
  const i = css.indexOf(from); const j = to ? css.indexOf(to, i) : css.length;
  if (i < 0 || j < 0) throw new Error('Chrome CSS marker not found: ' + from);
  return css.slice(i, j);
}

function makeBlock(o) {
  const ROOT = '#' + o.rootId;
  const chrome = siteChrome({ prefix: o.prefix, current: null, breadcrumb: null, system: false, global: true, currentAttrs: o.currentAttrs });
  const markup = '<div id="' + o.rootId + '" class="' + o.prefix + '-root">\n' + chrome[o.part] + '\n</div>';
  const chromeCss = chrome.css();
  const css = scopeCss(read('base.css') + '\n' + (o.part === 'header'
    ? part(chromeCss, '/* SiteHeader.dc.html', '/* SiteFooter.dc.html') + '\n' + read('site-header.css')
    : part(chromeCss, '/* SiteFooter.dc.html')), ROOT, o.prefix + '-');
  const js = read(o.js).replace('/*@site-chrome*/', () => chrome.runtime);
  if (js === read(o.js)) throw new Error('/*@site-chrome*/ marker missing from ' + o.js);

  // link config: every key in the markup, as its existing Custom Value reference
  const keys = [...new Set([...markup.matchAll(new RegExp('data-' + o.prefix + '-link="([^"]+)"', 'g'))].map((m) => m[1]))];
  const links = {};
  keys.forEach((k) => { links[k] = siteLinks.reference(k, 'global'); });
  const htmlCode = markup.replace(/<!--[\s\S]*?-->/g, '');
  const jsCode = js.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  [/\.dc\.html/, /\.\/assets\//, /\/vendor\//, /support\.js/, /localhost/, /file:\/\//, /\{\{/, /unpkg\.com/].forEach((re) => {
    if (re.test(htmlCode) || re.test(jsCode) || re.test(css)) throw new Error('Forbidden reference ' + re + ' in ' + o.rootId);
  });

  function assemble(logoValue, variant) {
    const cfg = Object.assign({ logoImage: logoValue }, o.settings, { links });
    const cfgBlock = '<script type="application/json" id="' + o.rootId + '-config">\n' + JSON.stringify(chrome.imageConfig(cfg), null, 2) + '\n</script>';
    return ['<!--', '  BWCI — ' + o.title + ' · GoHighLevel Custom Code block (' + variant + ')'].concat(o.banner, ['-->']).join('\n') + '\n' +
      cfgBlock + '\n<style>\n' + css + '</style>\n\n' + markup + '\n\n<script>\n' + js + '\n</script>\n';
  }
  const hosted = assemble('{{ custom_values.bwci_img_logo }}', 'production — hosted logo');
  const inline = assemble(dataUri(chrome.logoPath), 'self-contained — embedded logo');
  fs.writeFileSync(path.join(OUT, o.file + '.ghl.html'), hosted);
  fs.writeFileSync(path.join(OUT, o.file + '.inline.ghl.html'), inline);
  console.log(o.file + '.ghl.html        ', (Buffer.byteLength(hosted) / 1024).toFixed(1) + ' KB, ' + keys.length + ' links');
  console.log(o.file + '.inline.ghl.html ', (Buffer.byteLength(inline) / 1024).toFixed(1) + ' KB');
}

makeBlock({
  title: 'GLOBAL SITE HEADER', rootId: 'bwci-site-header', prefix: 'bwh', part: 'header', currentAttrs: true,
  js: 'site-header.js', file: 'site-header', settings: { raiseSection: true },
  banner: [
    '  Source: design/SiteHeader.dc.html (utility bar, main navigation with dropdowns, mobile drawer)',
    '  Generated by ghl/global/_build/build.js',
    '  Paste this whole file into ONE GoHighLevel "Custom Code" element in a full-width GLOBAL SECTION (not a section',
    '  template) with no padding, and place that section at the very top of every page whose block was built with',
    '  --global. Editing the global section then updates the header on every page.',
    '  Edit ONLY the JSON block below: "logoImage" (image URL), "raiseSection" (true lifts the GoHighLevel section above',
    '  the page so the pinned header and its menus stay on top) and "links" ("#" = no GoHighLevel value yet).',
    '  The current page is marked from the page block (data-bwci-current), not from this block.',
  ],
});
makeBlock({
  title: 'GLOBAL SITE FOOTER', rootId: 'bwci-site-footer', prefix: 'bwf', part: 'footer', currentAttrs: false,
  js: 'site-footer.js', file: 'site-footer',
  settings: { footer: { regulatoryLine: '', registeredJurisdiction: '', companyNumber: '', registeredOffice: '' } },
  banner: [
    '  Source: design/SiteFooter.dc.html',
    '  Generated by ghl/global/_build/build.js',
    '  Paste this whole file into ONE GoHighLevel "Custom Code" element in a full-width GLOBAL SECTION (not a section',
    '  template) with no padding, and place that section at the very bottom of every page whose block was built with',
    '  --global. Editing the global section then updates the footer on every page.',
    '  Edit ONLY the JSON block below: "logoImage" (image URL), "footer" (legal wording, shown once filled in) and',
    '  "links" ("#" = no GoHighLevel value yet).',
  ],
});
