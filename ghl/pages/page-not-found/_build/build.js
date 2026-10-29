#!/usr/bin/env node
// Dev-only build: assembles the GoHighLevel Custom Code blocks for the Page not found (404) page.
//   node ghl/pages/page-not-found/_build/build.js
// Inputs : _build/src/page-not-found.{config.json,css,html,js}, the shared link/image resolvers and the logo /
//          unavailable-link part of the shared site chrome (the page has no site header, breadcrumb or footer), and
//          _build/source/BWCI_404.html (the standalone Claude Design export, read for its checks only)
// Outputs: page-not-found.ghl.html (Custom Value image references only) and
//          page-not-found.inline.ghl.html (the same references, plus the original logo and cone as imageFallbacks)
// Nothing in _build/ is needed at runtime.
//
// What it does beyond concatenation (same pipeline as the Verify a Communication build):
//   1. prefixes every CSS selector with #bwci-page-not-found (":scope" = the root) and fails on any unscoped selector;
//   2. drops selectors that can never match (a class or id in neither the markup nor DYNAMIC_CLASSES); --report lists them;
//   3. drops @keyframes nothing references, and requires nf- namespaced keyframe names;
//   4. checks the link keys in the markup against the config (and the config against the shared link mapping),
//      and rejects Claude Design / local paths;
//   5. checks the source export: its links map to exactly the page's link keys, its fonts match FONT_LINKS, and the
//      logo and cone copies are byte-identical to the images it embeds.
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = '#bwci-page-not-found';
const KEYFRAME_PREFIX = 'nf-';
const PAGE_DIR = path.resolve(__dirname, '..');
const SRC = path.join(__dirname, 'src');
const SOURCE = path.join(__dirname, 'source', 'BWCI_404.html');
const CONE = path.join(PAGE_DIR, 'assets', 'not-found-cone.png');
const REPORT = process.argv.includes('--report');
// classes the runtime adds outside the static markup
const DYNAMIC_CLASSES = [];
// the logo, image and unavailable-link handling of the shared site chrome; no header, footer or system CSS
const chrome = require('../../../shared/site-chrome/site-chrome')({
  prefix: 'nf', current: null, system: false, images: ['notFoundConeImage'],
});
const siteLinks = require('../../../shared/site-links');
const { HREF_KEYS } = require('../../../shared/site-chrome/site-chrome');

/* ---------------- CSS parsing helpers ---------------- */
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
function scopeSelector(s) {
  if (s.startsWith(':scope')) return ROOT + s.slice(6);
  if (s.startsWith(ROOT)) return s;
  return ROOT + ' ' + s;
}

/* ---------------- inputs ---------------- */
const html = fs.readFileSync(path.join(SRC, 'page-not-found.html'), 'utf8').trim();
const jsSrc = fs.readFileSync(path.join(SRC, 'page-not-found.js'), 'utf8').trim();
if (!jsSrc.includes('/*@site-chrome*/')) throw new Error('/*@site-chrome*/ marker missing from page-not-found.js');
const js = jsSrc.replace('/*@site-chrome*/', () => chrome.runtime);
const config = JSON.parse(fs.readFileSync(path.join(SRC, 'page-not-found.config.json'), 'utf8'));
const cssSrc = fs.readFileSync(path.join(SRC, 'page-not-found.css'), 'utf8');

const htmlCode = html.replace(/<!--[\s\S]*?-->/g, '');
const usedClasses = new Set(DYNAMIC_CLASSES);
for (const m of htmlCode.matchAll(/\bclass="([^"]*)"/g)) m[1].split(/\s+/).filter(Boolean).forEach((c) => usedClasses.add(c));
const usedIds = new Set(['bwci-page-not-found']);
for (const m of htmlCode.matchAll(/\bid="([^"]+)"/g)) usedIds.add(m[1]);
DYNAMIC_CLASSES.forEach((c) => { if (!js.includes("'" + c + "'")) throw new Error('DYNAMIC_CLASSES entry not found in page-not-found.js: ' + c); });

// a selector is dead when it requires a class/id that never exists. :not(...) and [attr] parts are
// ignored (a :not() of an absent class is always true).
function deadReason(sel) {
  const bare = sel.replace(/:not\((?:[^()]|\([^()]*\))*\)/g, '').replace(/\[[^\]]*\]/g, '').replace(/"[^"]*"|'[^']*'/g, '');
  for (const m of bare.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) if (!usedClasses.has(m[1])) return '.' + m[1];
  for (const m of bare.matchAll(/#(-?[_a-zA-Z][\w-]*)/g)) if (!usedIds.has(m[1])) return '#' + m[1];
  return null;
}

/* ---------------- CSS: scope + prune ---------------- */
const pruned = [];
const keyframes = new Map(); // name -> css text
function processBlock(css, indent) {
  let out = '', i = 0;
  while (i < css.length) {
    while (i < css.length && /\s/.test(css[i])) i++;
    if (i >= css.length) break;
    if (css[i] === '@') {
      const name = /^@[\w-]+/.exec(css.slice(i))[0];
      if (name === '@import') throw new Error('Do not use @import; fonts are loaded by FONT_LINKS');
      const open = scanTo(css, i, ['{']);
      const close = matchBrace(css, open);
      const prelude = css.slice(i, open).trim().replace(/\s+/g, ' ');
      if (/^@(-webkit-)?keyframes/.test(name)) {
        const kf = prelude.split(' ')[1];
        if (!kf.startsWith(KEYFRAME_PREFIX)) throw new Error('Keyframes must be ' + KEYFRAME_PREFIX + ' namespaced: ' + kf);
        keyframes.set(kf, indent + prelude + '{ ' + css.slice(open + 1, close).replace(/\s+/g, ' ').trim() + ' }\n');
        out += '\u0000KF:' + kf + '\u0000';
      } else {
        const inner = processBlock(css.slice(open + 1, close), indent + '  ');
        if (inner.replace(/\u0000KF:[^\u0000]*\u0000/g, '').trim() || inner.includes('\u0000KF:')) out += indent + prelude + '{\n' + inner + indent + '}\n';
      }
      i = close + 1; continue;
    }
    const open = scanTo(css, i, ['{']);
    if (open === -1) throw new Error('Dangling CSS: ' + css.slice(i, i + 80));
    const close = matchBrace(css, open);
    const live = [];
    splitSelectors(css.slice(i, open)).forEach((s) => {
      const why = deadReason(s);
      if (why) pruned.push(s + '   (' + why + ' never rendered)'); else live.push(scopeSelector(s));
    });
    const body = css.slice(open + 1, close).replace(/\s+/g, ' ').trim();
    if (live.length) out += indent + live.join(', ') + '{ ' + body + ' }\n';
    i = close + 1;
  }
  return out;
}
let scoped = processBlock(stripComments(cssSrc), '');
// keep only keyframes the remaining CSS uses
const bodyText = scoped.replace(/\u0000KF:[^\u0000]*\u0000/g, '');
const keptKf = [], droppedKf = [];
scoped = scoped.replace(/\u0000KF:([^\u0000]*)\u0000/g, (_, kf) => {
  if (new RegExp('\\b' + kf + '\\b').test(bodyText)) { keptKf.push(kf); return keyframes.get(kf); }
  droppedKf.push(kf); return '';
});
// remove @media blocks left empty
for (let prev; prev !== scoped;) { prev = scoped; scoped = scoped.replace(/^@[^{\n]+\{\n\}\n/gm, ''); }
// every referenced keyframe must exist
for (const m of bodyText.matchAll(/animation(?:-name)?\s*:\s*([^;}]+)/g)) {
  m[1].split(',').forEach((part) => part.trim().split(/\s+/).forEach((tok) => {
    if (/^nf-[\w-]+$/.test(tok) && !keyframes.has(tok)) throw new Error('Animation references missing keyframes: ' + tok);
  }));
}
// every selector must be scoped
scoped.split('\n').forEach((line) => {
  const t = line.trim();
  if (!t || t === '}' || t.startsWith('@') || /^(from|to|\d+%)/.test(t)) return;
  splitSelectors(t.slice(0, t.indexOf('{'))).forEach((s) => { if (!s.startsWith(ROOT)) throw new Error('Unscoped selector: ' + s); });
});
const css = scoped;

// The fonts the source export embeds: JetBrains Mono 500–700 and Plus Jakarta Sans 400–800 (checked below).
const FONTS = { 'JetBrains Mono': [500, 600, 700], 'Plus Jakarta Sans': [400, 500, 600, 700, 800] };
const FONT_LINKS = [
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?' + Object.entries(FONTS).map(([f, w]) => 'family=' + f.replace(/ /g, '+') + ':wght@' + w.join(';')).join('&') + '&display=swap">',
].join('\n');

/* ---------------- checks: the source export ---------------- */
const bundle = fs.readFileSync(SOURCE, 'utf8');
const island = (type) => { const m = new RegExp('<script type="__bundler/' + type + '">\\s*([\\s\\S]*?)\\s*</script>').exec(bundle); if (!m) throw new Error('Source export: no ' + type); return JSON.parse(m[1]); };
const manifest = island('manifest');
const template = island('template');
const embedded = (uuid) => { const e = manifest[uuid]; const b = Buffer.from(e.data, 'base64'); return e.compressed ? zlib.gunzipSync(b) : b; };
const imgCount = [...template.matchAll(/<img\b/g)].length;
if (imgCount !== 2) throw new Error('Source export: expected the logo and the cone images, found ' + imgCount);
const logoUuid = (/<img src="([0-9a-f-]{36})" alt="Better World Capital Investments PLC"/.exec(template) || [])[1];
const coneUuid = (/<img class="nf-cone" src="([0-9a-f-]{36})"/.exec(template) || [])[1];
if (!logoUuid || !coneUuid) throw new Error('Source export: logo / cone image not identified');
if (!embedded(logoUuid).equals(fs.readFileSync(chrome.logoPath))) throw new Error('Source logo differs from ' + chrome.logoPath);
if (!embedded(coneUuid).equals(fs.readFileSync(CONE))) throw new Error('assets/not-found-cone.png differs from the source export');
const srcKeys = new Set([...template.matchAll(/href="([^"#][^"]*)"/g)].map((m) => { if (!(m[1] in HREF_KEYS)) throw new Error('Source href without a link key: ' + m[1]); return HREF_KEYS[m[1]]; }));
const srcFonts = {};
for (const m of template.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
  const fam = /font-family:\s*'([^']+)'/.exec(m[1])[1], w = +/font-weight:\s*(\d+)/.exec(m[1])[1];
  (srcFonts[fam] = srcFonts[fam] || new Set()).add(w);
}
if (JSON.stringify(Object.keys(srcFonts).sort()) !== JSON.stringify(Object.keys(FONTS).sort()) ||
  Object.keys(FONTS).some((f) => [...srcFonts[f]].sort().join() !== FONTS[f].join())) throw new Error('Source fonts differ from FONT_LINKS: ' + JSON.stringify(Object.fromEntries(Object.entries(srcFonts).map(([k, v]) => [k, [...v]]))));

/* ---------------- checks: links and references ---------------- */
const usedKeys = new Set([...htmlCode.matchAll(/data-nf-link="([^"]+)"/g)].map((m) => m[1]));
const cfgKeys = new Set(Object.keys(config.links));
if ([...srcKeys].sort().join() !== [...usedKeys].sort().join()) throw new Error('Source link keys ' + [...srcKeys] + ' differ from the markup ' + [...usedKeys]);
usedKeys.forEach((k) => { if (!cfgKeys.has(k)) throw new Error('Link key missing from config: ' + k); });
// every value is the shared mapping's reference for its key
cfgKeys.forEach((k) => { if (config.links[k] !== siteLinks.reference(k, 'page-not-found')) throw new Error('Link ' + k + ' differs from the shared mapping: ' + config.links[k]); });
cfgKeys.forEach((k) => { if (!usedKeys.has(k)) throw new Error('Unused link key in config: ' + k); });
const jsCode = js.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
[/\.dc\.html/, /\.\/assets\//, /\/vendor\//, /support\.js/, /localhost/, /file:\/\//, /\{\{/, /unpkg\.com/, /__bundler/].forEach((re) => {
  if (re.test(htmlCode) || re.test(jsCode) || re.test(css)) throw new Error('Forbidden reference ' + re + ' in output');
});

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const dataUri = (file) => 'data:' + MIME[path.extname(file)] + ';base64,' + fs.readFileSync(file).toString('base64');

/* ---------------- assemble ---------------- */
function banner(variant) {
  return [
    '<!--',
    '  BWCI — PAGE NOT FOUND (404) · GoHighLevel Custom Code block (' + variant + ')',
    '  Source: ghl/pages/page-not-found/_build/source/BWCI_404.html (Claude Design standalone export)',
    '  Generated by ghl/pages/page-not-found/_build/build.js',
    '  Paste this whole file into ONE GoHighLevel "Custom Code" element placed in a full-width section with no padding.',
    '  Edit ONLY the JSON block below: "logoImage" and "notFoundConeImage" (image URLs) and "links" (the Home and',
    '  Contact pages; "#" marks a destination that has no GoHighLevel page yet).',
    '-->',
  ].join('\n');
}
function assemble(images, variant) {
  const cfg = Object.assign({}, config, images);
  const cfgBlock = '<script type="application/json" id="bwci-page-not-found-config">\n' + JSON.stringify(chrome.imageConfig(cfg), null, 2) + '\n</script>';
  return banner(variant) + '\n' + cfgBlock + '\n' + FONT_LINKS + '\n<style>\n' + css + '</style>\n\n' + html + '\n\n<script>\n' + js + '\n</script>\n';
}
const ghl = assemble({}, 'production — hosted images');
const inline = assemble({ logoImage: dataUri(chrome.logoPath), notFoundConeImage: dataUri(CONE) }, 'self-contained — embedded images');
fs.writeFileSync(path.join(PAGE_DIR, 'page-not-found.ghl.html'), ghl);
fs.writeFileSync(path.join(PAGE_DIR, 'page-not-found.inline.ghl.html'), inline);

console.log('keyframes kept   :', keptKf.join(', '));
console.log('keyframes dropped:', droppedKf.join(', ') || '-');
console.log('selectors dropped:', pruned.length + (REPORT ? '' : ' (run with --report to list)'));
if (REPORT) pruned.forEach((p) => console.log('   ' + p));
console.log('page-not-found.ghl.html        ', (Buffer.byteLength(ghl) / 1024).toFixed(1) + ' KB');
console.log('page-not-found.inline.ghl.html ', (Buffer.byteLength(inline) / 1024).toFixed(1) + ' KB');
