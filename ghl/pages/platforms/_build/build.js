#!/usr/bin/env node
// Dev-only build: assembles the GoHighLevel Custom Code blocks for the Platforms page.
//   node ghl/pages/platforms/_build/build.js
// Inputs : _build/src/platforms.{config.json,css,html,js}, assets/plat-hero-rails.png
// Outputs: platforms.ghl.html (hosted image URL) and platforms.inline.ghl.html (embedded image)
// Nothing in _build/ is needed at runtime.
//
// What it does beyond concatenation:
//   0. fills the <!--view:NAME--> markers in the markup with the default directory state, rendered by the
//      VIEW part of platforms.js (so the static HTML and the runtime markup cannot drift apart);
//   1. prefixes every CSS selector with #bwci-platforms (":scope" = the root itself) and fails on any
//      unscoped selector;
//   2. drops selectors that can never match: a selector naming a class or id that appears neither in
//      the markup, in any directory state the VIEW code can render, nor in DYNAMIC_CLASSES. The source export carries
//      CSS for sections it no longer renders; this keeps them out of the paste. Every drop is listed
//      with --report;
//   3. drops @keyframes nothing references, and requires plt- namespaced keyframe names;
//   4. checks the link keys in the markup against the config, and rejects Claude Design / local paths.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = '#bwci-platforms';
const KEYFRAME_PREFIX = 'plt-';
const PAGE_DIR = path.resolve(__dirname, '..');
const SRC = path.join(__dirname, 'src');
const IMAGE = path.join(PAGE_DIR, 'assets', 'plat-hero-rails.png');
const REPORT = process.argv.includes('--report');
// classes the runtime adds outside the VIEW markup (keep in sync with platforms.js)
const DYNAMIC_CLASSES = ['plt-js', 'rv-in', 'plt-hdr--stuck'];

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
const htmlSrc = fs.readFileSync(path.join(SRC, 'platforms.html'), 'utf8').trim();
const js = fs.readFileSync(path.join(SRC, 'platforms.js'), 'utf8').trim();
const config = JSON.parse(fs.readFileSync(path.join(SRC, 'platforms.config.json'), 'utf8'));
const cssSrc = fs.readFileSync(path.join(SRC, 'platforms.css'), 'utf8');

/* ---------------- 0. default directory state from the script's VIEW code ---------------- */
const viewStart = js.indexOf('/* VIEW:start');
const viewEnd = js.indexOf('/* VIEW:end */');
if (viewStart < 0 || viewEnd < 0) throw new Error('VIEW markers missing from platforms.js');
// eslint-disable-next-line no-new-func
const V = new Function(js.slice(viewStart, viewEnd) + '\nreturn { VIEW: VIEW, CAPS: CAPS, MAT_OPTS: MAT_OPTS, REL_OPTS: REL_OPTS, DEFAULT_STATE: DEFAULT_STATE };')();
const S0 = Object.assign({}, V.DEFAULT_STATE);
const opCount = V.CAPS.filter((c) => c.mat === 'Operating').length;
const views = {
  r1Count: V.VIEW.count(opCount), r2Count: V.VIEW.count(V.CAPS.length - opCount),
  r1Links: V.VIEW.rxLinks(['Operating']), r2Links: V.VIEW.rxLinks(['In Development', 'Proposed']),
  reg1: V.VIEW.tiles(1), reg2: V.VIEW.tiles(2), total: V.VIEW.count(V.CAPS.length),
  mixBar: V.VIEW.mixBar(S0), mix: V.VIEW.mix(S0), matOpts: V.VIEW.chips('mat', S0), relOpts: V.VIEW.chips('rel', S0),
  tbRes: V.VIEW.tbRes(S0), results: V.VIEW.results(S0),
};
const html = htmlSrc.replace(/<!--view:(\w+)-->/g, (_, k) => { if (!(k in views)) throw new Error('Unknown view marker: ' + k); return views[k]; });
// every markup the directory can produce (all filter combinations, both views, each open row, each jump)
const viewClasses = new Set();
const collect = (h) => { for (const m of h.matchAll(/\bclass="([^"]*)"/g)) m[1].split(/\s+/).filter(Boolean).forEach((c) => viewClasses.add(c)); };
const jumps = [null].concat(V.CAPS.map((c) => ({ name: c.name, single: true, filter: c.mat + ' · ' + c.rel })),
  ['Operating', 'In Development', 'Proposed'].map((m) => ({ name: m + ' platforms', single: false, filter: m })));
V.MAT_OPTS.forEach(([mat]) => V.REL_OPTS.forEach(([rel]) => ['grid', 'list'].forEach((view) => [null].concat(V.CAPS.map((c) => c.name)).forEach((open) => jumps.forEach((jump) => {
  const S = { mat, rel, view, open, jump };
  collect(V.VIEW.results(S)); collect(V.VIEW.tbRes(S)); collect(V.VIEW.chips('mat', S)); collect(V.VIEW.chips('rel', S)); collect(V.VIEW.mixBar(S)); collect(V.VIEW.mix(S));
  if (jump) collect(V.VIEW.jump(S));
}))))); 

const htmlCode = html.replace(/<!--[\s\S]*?-->/g, '');
const usedClasses = new Set(DYNAMIC_CLASSES.concat([...viewClasses]));
for (const m of htmlCode.matchAll(/\bclass="([^"]*)"/g)) m[1].split(/\s+/).filter(Boolean).forEach((c) => usedClasses.add(c));
const usedIds = new Set(['bwci-platforms']);
for (const m of htmlCode.matchAll(/\bid="([^"]+)"/g)) usedIds.add(m[1]);
// every dynamic class must really be added by the script
DYNAMIC_CLASSES.forEach((c) => { if (!js.includes("'" + c + "'")) throw new Error('DYNAMIC_CLASSES entry not found in platforms.js: ' + c); });

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
    if (/^plt-[\w-]+$/.test(tok) && !keyframes.has(tok)) throw new Error('Animation references missing keyframes: ' + tok);
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
const usedKeys = new Set([...htmlCode.matchAll(/data-plt-link="([^"]+)"/g)].map((m) => m[1]));
const cfgKeys = new Set(Object.keys(config.links));
usedKeys.forEach((k) => { if (!cfgKeys.has(k)) throw new Error('Link key missing from config: ' + k); });
cfgKeys.forEach((k) => { if (!usedKeys.has(k)) throw new Error('Unused link key in config: ' + k); });
// in-page anchors (static markup and every VIEW output) must point at ids that exist
for (const m of (htmlCode + V.VIEW.results({ mat: 'All', rel: 'All', view: 'list', open: V.CAPS[0].name, jump: null })).matchAll(/href="#([^"]+)"/g)) if (!usedIds.has(m[1])) throw new Error('In-page link to missing id: #' + m[1]);
const jsCode = js.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
[/\.dc\.html/, /\.\/assets\//, /\/vendor\//, /support\.js/, /localhost/, /file:\/\//, /\{\{/, /unpkg\.com/].forEach((re) => {
  if (re.test(htmlCode) || re.test(jsCode) || re.test(css)) throw new Error('Forbidden reference ' + re + ' in output');
});

/* ---------------- assemble ---------------- */
function banner(variant) {
  return [
    '<!--',
    '  BWCI — PLATFORMS, INSTITUTIONS & CONNECTED CAPABILITIES · GoHighLevel Custom Code block (' + variant + ')',
    '  Source: design/Platforms.dc.html (+ design/SiteHeader.dc.html) · generated by ghl/pages/platforms/_build/build.js',
    '  Paste this whole file into ONE GoHighLevel "Custom Code" element placed in a full-width section with no padding.',
    '  Edit ONLY the JSON block below: "platformsHeroImage" (hero image URL), "showHeader", "showFooter",',
    '  "directory" (syncUrl) and "links" (every link on the page that points to another page).',
    '-->',
  ].join('\n');
}
function assemble(imageValue, variant) {
  const cfg = Object.assign({}, config, { platformsHeroImage: imageValue });
  const cfgBlock = '<script type="application/json" id="bwci-platforms-config">\n' + JSON.stringify(cfg, null, 2) + '\n</script>';
  return banner(variant) + '\n' + cfgBlock + '\n' + FONT_LINKS + '\n<style>\n' + css + '</style>\n\n' + html + '\n\n<script>\n' + js + '\n</script>\n';
}
const ghl = assemble(config.platformsHeroImage, 'production — hosted image');
const inline = assemble('data:image/png;base64,' + fs.readFileSync(IMAGE).toString('base64'), 'self-contained — embedded image');
fs.writeFileSync(path.join(PAGE_DIR, 'platforms.ghl.html'), ghl);
fs.writeFileSync(path.join(PAGE_DIR, 'platforms.inline.ghl.html'), inline);

console.log('keyframes kept   :', keptKf.join(', '));
console.log('keyframes dropped:', droppedKf.join(', ') || '-');
console.log('selectors dropped:', pruned.length + (REPORT ? '' : ' (run with --report to list)'));
if (REPORT) pruned.forEach((p) => console.log('   ' + p));
console.log('platforms.ghl.html        ', (Buffer.byteLength(ghl) / 1024).toFixed(1) + ' KB');
console.log('platforms.inline.ghl.html ', (Buffer.byteLength(inline) / 1024).toFixed(1) + ' KB');
