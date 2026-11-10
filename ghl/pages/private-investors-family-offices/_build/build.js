#!/usr/bin/env node
// Dev-only build: assembles the GoHighLevel Custom Code blocks for the Private Investors & Family Offices page.
//   node ghl/pages/private-investors-family-offices/_build/build.js
// Inputs : _build/src/private-investors-family-offices.{config.json,css,html,js} and the shared site chrome
//          (ghl/shared/site-chrome: header, breadcrumb, footer, bwci-system.css parts A–E, bwci-motion.js, and the
//          shared link/image resolvers)
// Outputs: private-investors-family-offices.ghl.html (Custom Value image references only) and
//          private-investors-family-offices.inline.ghl.html (the same references, plus the original logo and both page images as imageFallbacks)
// Nothing in _build/ is needed at runtime.
//
// What it does beyond concatenation (same pipeline as the Who We Are build):
//   -. inserts the shared site chrome at the <!--chrome:header|breadcrumb|footer--> markers, after the page CSS (the
//      source cascade order) and at the /*@site-chrome*/ marker;
//   1. prefixes every CSS selector with #bwci-private-investors-family-offices (":scope" = the root) and fails on any unscoped
//      selector;
//   2. drops selectors that can never match (a class or id in neither the markup nor DYNAMIC_CLASSES); --report lists them;
//   3. drops @keyframes nothing references, and requires pfo- namespaced keyframe names;
//   4. checks the link keys in the markup against the config (and the config against the shared link mapping),
//      and rejects Claude Design / local paths.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = '#bwci-private-investors-family-offices';
const KEYFRAME_PREFIX = 'pfo-';
const PAGE_DIR = path.resolve(__dirname, '..');
const SRC = path.join(__dirname, 'src');
const REPORT = process.argv.includes('--report');
// --global: the page block for use with the global header and footer (ghl/global/): no header or footer, no logo /
// header / footer settings, only the links the page itself uses, and the root marked data-bwci-current for the global
// header. Writes private-investors-family-offices.global*.ghl.html; the regular outputs are untouched.
const GLOBAL = process.argv.includes('--global');
const forGlobal = (c) => {
  if (!GLOBAL) return c;
  const o = Object.assign({}, c);
  ['logoImage', 'showHeader', 'showFooter', 'footer'].forEach((k) => { delete o[k]; });
  if (o.imageFallbacks) { o.imageFallbacks = Object.assign({}, o.imageFallbacks); delete o.imageFallbacks.logoImage; if (!Object.keys(o.imageFallbacks).length) delete o.imageFallbacks; }
  return o;
};
const globalBanner = (s) => (GLOBAL ? s.replace(/^<!--\n/, '<!--\n' +
  '  FOR THE GLOBAL HEADER AND FOOTER (built with --global): this block has NO header or footer of its own. Paste it\n' +
  '  between the "BWCI Header" and "BWCI Footer" GoHighLevel Global Sections (ghl/global/). The logo, header/footer\n' +
  '  and footer-wording settings live in those sections; any such setting named below is not in this block.\n') : s);

// classes the runtime adds outside the static markup (keep in sync with the shared site chrome)
const DYNAMIC_CLASSES = ['pfo-lit', 'pfo-tc', 'pfo-tc--inv'];
// every source class name carries the pfo- prefix; bwci-system.css is renamed to match
const rename = (n) => 'pfo-' + n;
const pageCss = fs.readFileSync(path.join(__dirname, 'src', 'private-investors-family-offices.css'), 'utf8');
// shared site chrome: SiteHeader current="investors", Breadcrumb current="private"; content:true adds bwci-system.css
// parts C and E
const chrome = require('../../../shared/site-chrome/site-chrome')({
  global: GLOBAL,
  prefix: 'pfo', current: 'investors', breadcrumb: 'private', content: true, rename, images: ['privateInvestorsHeroImage', 'privateInvestorsImpactImage'],
});
const siteLinks = require('../../../shared/site-links');

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
const htmlSrc = fs.readFileSync(path.join(SRC, 'private-investors-family-offices.html'), 'utf8').trim()
  .replace(/<!--chrome:(header|breadcrumb|footer)-->/g, (_, k) => (GLOBAL && (k === 'header' || k === 'footer') ? '' : chrome[k]))
  .replace('id="' + ROOT.slice(1) + '"', (m) => (GLOBAL ? m + ' data-bwci-current="' + chrome.current + '"' : m));
const jsSrc = fs.readFileSync(path.join(SRC, 'private-investors-family-offices.js'), 'utf8').trim();
if (!jsSrc.includes('/*@site-chrome*/')) throw new Error('/*@site-chrome*/ marker missing from private-investors-family-offices.js');
const js = jsSrc.replace('/*@site-chrome*/', () => chrome.runtime);
const config = JSON.parse(fs.readFileSync(path.join(SRC, 'private-investors-family-offices.config.json'), 'utf8'));
const cssSrc = pageCss + '\n' + chrome.css();

const html = htmlSrc;

const htmlCode = html.replace(/<!--[\s\S]*?-->/g, '');
const usedClasses = new Set(DYNAMIC_CLASSES.concat(chrome.dynamicClasses));
for (const m of htmlCode.matchAll(/\bclass="([^"]*)"/g)) m[1].split(/\s+/).filter(Boolean).forEach((c) => usedClasses.add(c));
const usedIds = new Set(['bwci-private-investors-family-offices']);
for (const m of htmlCode.matchAll(/\bid="([^"]+)"/g)) usedIds.add(m[1]);
// every dynamic class must really be added by the script
DYNAMIC_CLASSES.concat(chrome.dynamicClasses).forEach((c) => { if (!js.includes("'" + c + "'")) throw new Error('DYNAMIC_CLASSES entry not found in private-investors-family-offices.js: ' + c); });

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
    if (/^pfo-[\w-]+$/.test(tok) && !keyframes.has(tok)) throw new Error('Animation references missing keyframes: ' + tok);
  }));
}
// every selector must be scoped
scoped.split('\n').forEach((line) => {
  const t = line.trim();
  if (!t || t === '}' || t.startsWith('@') || /^(from|to|\d+%)/.test(t)) return;
  splitSelectors(t.slice(0, t.indexOf('{'))).forEach((s) => { if (!s.startsWith(ROOT)) throw new Error('Unscoped selector: ' + s); });
});
const css = scoped;

// The source's font link, exactly.
const FONT_LINKS = [
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap">',
].join('\n');

/* ---------------- checks ---------------- */
const usedKeys = new Set([...htmlCode.matchAll(/data-pfo-link="([^"]+)"/g)].map((m) => m[1]));
if (GLOBAL) Object.keys(config.links).forEach((k) => { if (!usedKeys.has(k)) delete config.links[k]; });
const cfgKeys = new Set(Object.keys(config.links));
usedKeys.forEach((k) => { if (!cfgKeys.has(k)) throw new Error('Link key missing from config: ' + k); });
// every value is the shared mapping's reference for its key (existing Custom Values, or a proposed one)
cfgKeys.forEach((k) => { if (config.links[k] !== siteLinks.reference(k, 'private-investors-family-offices')) throw new Error('Link ' + k + ' differs from the shared mapping: ' + config.links[k]); });
cfgKeys.forEach((k) => { /* Only known legacy keys retain their original configuration semantics. */ if (!usedKeys.has(k) && !chrome.legacyLinkKeys.includes(k)) throw new Error('Unused link key in config: ' + k); });
// in-page anchors (static markup and every VIEW output) must point at ids that exist
for (const m of htmlCode.matchAll(/(?:href|value)="#([^"]+)"/g)) if (!usedIds.has(m[1])) throw new Error('In-page link to missing id: #' + m[1]);
const jsCode = js.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
[/\.dc\.html/, /\.\/assets\//, /\/vendor\//, /support\.js/, /localhost/, /file:\/\//, /\{\{/, /unpkg\.com/].forEach((re) => {
  if (re.test(htmlCode) || re.test(jsCode) || re.test(css)) throw new Error('Forbidden reference ' + re + ' in output');
});

// the image copies are byte-identical to the design assets
const ASSETS = { privateInvestorsHeroImage: 'pf-hero-threads.png', privateInvestorsImpactImage: 'pf-impact-scale.png' };
const assetPath = (k) => path.join(PAGE_DIR, 'assets', ASSETS[k]);
Object.keys(ASSETS).forEach((k) => { if (!fs.readFileSync(assetPath(k)).equals(fs.readFileSync(path.resolve(PAGE_DIR, '../../../design/assets', ASSETS[k])))) throw new Error('assets/' + ASSETS[k] + ' differs from design/assets'); });

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const dataUri = (file) => 'data:' + MIME[path.extname(file)] + ';base64,' + fs.readFileSync(file).toString('base64');

/* ---------------- assemble ---------------- */
function banner(variant) {
  return [
    '<!--',
    '  BWCI — PRIVATE INVESTORS & FAMILY OFFICES · GoHighLevel Custom Code block (' + variant + ')',
    '  Source: design/Private Investors Family Offices.dc.html (+ SiteHeader, Breadcrumb, SiteFooter, bwci-system.css,',
    '  bwci-motion.js)',
    '  Generated by ghl/pages/private-investors-family-offices/_build/build.js',
    '  Paste this whole file into ONE GoHighLevel "Custom Code" element placed in a full-width section with no padding.',
    '  Edit ONLY the JSON block below: "logoImage", "privateInvestorsHeroImage" and "privateInvestorsImpactImage" (image',
    '  URLs), "showHeader", "showFooter", "showFlags" and "showPamCard" (source review/launch options), "footer" (legal',
    '  wording) and "links" (every link to another page; "#" marks a destination that has no GoHighLevel page yet).',
    '-->',
  ].join('\n');
}
function assemble(images, variant) {
  const cfg = Object.assign({}, config, images);
  const cfgBlock = '<script type="application/json" id="bwci-private-investors-family-offices-config">\n' + JSON.stringify(chrome.imageConfig(forGlobal(cfg)), null, 2) + '\n</script>';
  return banner(variant) + '\n' + cfgBlock + '\n' + FONT_LINKS + '\n<style>\n' + css + '</style>\n\n' + html + '\n\n<script>\n' + js + '\n</script>\n';
}
const ghl = assemble({}, 'production — hosted images');
const inline = assemble({ logoImage: dataUri(chrome.logoPath), privateInvestorsHeroImage: dataUri(assetPath('privateInvestorsHeroImage')), privateInvestorsImpactImage: dataUri(assetPath('privateInvestorsImpactImage')) }, 'self-contained — embedded images');
fs.writeFileSync(path.join(PAGE_DIR, GLOBAL ? 'private-investors-family-offices.global.ghl.html' : 'private-investors-family-offices.ghl.html'), globalBanner(ghl));
fs.writeFileSync(path.join(PAGE_DIR, GLOBAL ? 'private-investors-family-offices.global.inline.ghl.html' : 'private-investors-family-offices.inline.ghl.html'), globalBanner(inline));

console.log('keyframes kept   :', keptKf.join(', '));
console.log('keyframes dropped:', droppedKf.join(', ') || '-');
console.log('selectors dropped:', pruned.length + (REPORT ? '' : ' (run with --report to list)'));
if (REPORT) pruned.forEach((p) => console.log('   ' + p));
console.log('private-investors-family-offices.ghl.html        ', (Buffer.byteLength(ghl) / 1024).toFixed(1) + ' KB');
console.log('private-investors-family-offices.inline.ghl.html ', (Buffer.byteLength(inline) / 1024).toFixed(1) + ' KB');
