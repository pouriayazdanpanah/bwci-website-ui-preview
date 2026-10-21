#!/usr/bin/env node
// Dev-only build: standalone Agnes Gradzewicz GHL profile blocks.
//   node ghl/pages/profile-agnes-gradzewicz/_build/build.js
// Inputs : _build/src/profile-agnes-gradzewicz.{config.json,css,html,js}, the portraits in assets/, and the shared site
//          chrome (ghl/shared/site-chrome: header, breadcrumb, GovNav, person cards, footer, bwci-system.css parts
//          Aâ€“E, bwci-motion.js)
// Outputs: profile-agnes-gradzewicz.ghl.html (hosted image URLs) and profile-agnes-gradzewicz.inline.ghl.html (embedded images)
// Nothing in _build/ is needed at runtime.
//
// What it does beyond concatenation (same pipeline as the Platforms build):
//   -. inserts shared chrome and generated GovProfile sections at their markers, preserving the source
//      CSS cascade; embeds the shared chrome and profile context/drag runtimes at the script markers;
//   1. prefixes every CSS selector with #bwci-profile-agnes-gradzewicz (":scope" = the root itself) and fails on any
//      unscoped selector;
//   2. drops selectors that can never match: a selector naming a class or id that appears neither in the
//      markup nor in DYNAMIC_CLASSES. bwci-system.css carries components for every content page (forms,
//      portraits, rows, ...); only the ones this page renders are kept. Every drop is listed with --report;
//   3. drops @keyframes nothing references, and requires pag- namespaced keyframe names;
//   4. checks the link keys in the markup against the config, and rejects Claude Design / local paths.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = '#bwci-profile-agnes-gradzewicz';
const KEYFRAME_PREFIX = 'pag-';
const PAGE_DIR = path.resolve(__dirname, '..');
const SRC = path.join(__dirname, 'src');
const REPORT = process.argv.includes('--report');
// classes the runtime adds outside the static markup (keep in sync with the shared site chrome)
const DYNAMIC_CLASSES = ['pag-is-drag'];
const PAG_RENAME = new Set(['wrap', 'sec', 'sec--line', 'sec--subtle', 'lead', 'link', 'ar', 'h1', 'h3',
  'pg-hero', 'pg-hero--in', 'gv-portrait', 'pg-body', 'pg-kv', 'gv-also', 'is-drag']);
const pageCss = fs.readFileSync(path.join(SRC, 'profile-agnes-gradzewicz.css'), 'utf8');
const profile = require('../../../shared/site-chrome/site-chrome.profile')({
  slug: 'agnes-gradzewicz', prefix: 'pag', rename: (n) => PAG_RENAME.has(n) ? 'pag-' + n : n,
});
const chrome = profile.chrome;

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
const slugs = profile.imageSlugs;
const htmlSrc = fs.readFileSync(path.join(SRC, 'profile-agnes-gradzewicz.html'), 'utf8').trim()
  .replace(/<!--chrome:(header|breadcrumb|govnav|footer)-->/g, (_, k) => chrome[k])
  .replace(/<!--profile:(hero|biography|related)-->/g, (_, k) => profile[k]);
const jsSrc = fs.readFileSync(path.join(SRC, 'profile-agnes-gradzewicz.js'), 'utf8').trim();
if (!jsSrc.includes('/*@site-chrome*/') || !jsSrc.includes('/*@profile*/')) throw new Error('Runtime marker missing');
const js = jsSrc.replace('/*@site-chrome*/', () => chrome.runtime).replace('/*@profile*/', () => profile.runtime);
const config = JSON.parse(fs.readFileSync(path.join(SRC, 'profile-agnes-gradzewicz.config.json'), 'utf8'));
const cssSrc = pageCss + '\n' + chrome.css();

const html = htmlSrc;

const htmlCode = html.replace(/<!--[\s\S]*?-->/g, '');
const usedClasses = new Set(DYNAMIC_CLASSES.concat(chrome.dynamicClasses));
for (const m of htmlCode.matchAll(/\bclass="([^"]*)"/g)) m[1].split(/\s+/).filter(Boolean).forEach((c) => usedClasses.add(c));
const usedIds = new Set(['bwci-profile-agnes-gradzewicz']);
for (const m of htmlCode.matchAll(/\bid="([^"]+)"/g)) usedIds.add(m[1]);
// every dynamic class must really be added by the script
DYNAMIC_CLASSES.concat(chrome.dynamicClasses).forEach((c) => { if (!js.includes("'" + c + "'")) throw new Error('DYNAMIC_CLASSES entry not found in profile-agnes-gradzewicz.js: ' + c); });

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
    if (/^pag-[\w-]+$/.test(tok) && !keyframes.has(tok)) throw new Error('Animation references missing keyframes: ' + tok);
  }));
}
// every selector must be scoped
scoped.split('\n').forEach((line) => {
  const t = line.trim();
  if (!t || t === '}' || t.startsWith('@') || /^(from|to|\d+%)/.test(t)) return;
  splitSelectors(t.slice(0, t.indexOf('{'))).forEach((s) => { if (!s.startsWith(ROOT)) throw new Error('Unscoped selector: ' + s); });
});
const css = scoped;

// Identical to the Main and Financial Engine GHL blocks (loads correctly in GoHighLevel).
const FONT_LINKS = [
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap">',
].join('\n');

/* ---------------- checks ---------------- */
const usedKeys = new Set([...htmlCode.matchAll(/data-pag-link="([^"]+)"/g)].map((m) => m[1]));
const cfgKeys = new Set(Object.keys(config.links));
usedKeys.forEach((k) => { if (!cfgKeys.has(k)) throw new Error('Link key missing from config: ' + k); });
cfgKeys.forEach((k) => { if (!usedKeys.has(k)) throw new Error('Unused link key in config: ' + k); });
// in-page anchors (static markup and every VIEW output) must point at ids that exist
for (const m of htmlCode.matchAll(/(?:href|value)="#([^"]+)"/g)) if (!usedIds.has(m[1])) throw new Error('In-page link to missing id: #' + m[1]);
const jsCode = js.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
[/\.dc\.html/, /\.\/assets\//, /\/vendor\//, /support\.js/, /localhost/, /file:\/\//, /\{\{/, /unpkg\.com/].forEach((re) => {
  if (re.test(htmlCode) || re.test(jsCode) || re.test(css)) throw new Error('Forbidden reference ' + re + ' in output');
});

// every portrait in the markup has a config URL and a local asset, and nothing else is configured
const people = new Map(chrome.people.map((p) => [p.slug, p]));
const cfgSlugs = Object.keys(config.peopleImages || {});
slugs.forEach((sl) => { if (!cfgSlugs.includes(sl)) throw new Error('peopleImages missing: ' + sl); });
cfgSlugs.forEach((sl) => { if (!slugs.includes(sl)) throw new Error('Unused peopleImages entry: ' + sl); });
const assetOf = (sl) => {
  const p = people.get(sl);
  const file = path.join(PAGE_DIR, 'assets', path.basename(p.photoPath));
  if (!fs.readFileSync(file).equals(fs.readFileSync(p.photoPath))) throw new Error('assets/ copy differs from design: ' + file);
  return file;
};
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const dataUri = (file) => 'data:' + MIME[path.extname(file)] + ';base64,' + fs.readFileSync(file).toString('base64');

/* ---------------- assemble ---------------- */
function banner(variant) {
  return [
    '<!--',
    '  BWCI â€” GOVERNANCE Â· AGNES GRADZEWICZ Â· GoHighLevel Custom Code block (' + variant + ')',
    '  Source: design/Profile Agnes Gradzewicz.dc.html + GovProfile.dc.html (+ SiteHeader, Breadcrumb, GovNav, PersonCard, SiteFooter, bwci-people.js,',
    '  image-slot.js, bwci-system.css, bwci-motion.js)',
    '  Generated by ghl/pages/profile-agnes-gradzewicz/_build/build.js',
    '  Paste this whole file into ONE GoHighLevel "Custom Code" element placed in a full-width section with no padding.',
    '  Edit ONLY the JSON block below: "logoImage" and "peopleImages" (image URLs), "showHeader", "showFooter",',
    '  "footer" (legal wording) and "links" (every link to another page; "#" marks a destination that has no',
    '  GoHighLevel page yet).',
    '-->',
  ].join('\n');
}
function assemble(logoValue, peopleValues, variant) {
  const cfg = Object.assign({}, config, { logoImage: logoValue, peopleImages: peopleValues });
  const cfgBlock = '<script type="application/json" id="bwci-profile-agnes-gradzewicz-config">\n' + JSON.stringify(cfg, null, 2).replace(/</g, '\\u003c') + '\n</script>';
  return banner(variant) + '\n' + cfgBlock + '\n' + FONT_LINKS + '\n<style>\n' + css + '</style>\n\n' + html + '\n\n<script>\n' + js + '\n</script>\n';
}
const ghl = assemble(config.logoImage, config.peopleImages, 'production â€” hosted images');
const inline = assemble(dataUri(chrome.logoPath), Object.fromEntries(cfgSlugs.map((sl) => [sl, dataUri(assetOf(sl))])), 'self-contained â€” embedded images');
fs.writeFileSync(path.join(PAGE_DIR, 'profile-agnes-gradzewicz.ghl.html'), ghl);
fs.writeFileSync(path.join(PAGE_DIR, 'profile-agnes-gradzewicz.inline.ghl.html'), inline);

console.log('keyframes kept   :', keptKf.join(', '));
console.log('keyframes dropped:', droppedKf.join(', ') || '-');
console.log('selectors dropped:', pruned.length + (REPORT ? '' : ' (run with --report to list)'));
if (REPORT) pruned.forEach((p) => console.log('   ' + p));
console.log('profile-agnes-gradzewicz.ghl.html        ', (Buffer.byteLength(ghl) / 1024).toFixed(1) + ' KB');
console.log('profile-agnes-gradzewicz.inline.ghl.html ', (Buffer.byteLength(inline) / 1024).toFixed(1) + ' KB');
