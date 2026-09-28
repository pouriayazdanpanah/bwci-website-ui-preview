#!/usr/bin/env node
// Dev-only build: assembles the GoHighLevel Custom Code blocks for the Financial Engine page.
//   node ghl/pages/financial-engine/_build/build.js
// Inputs : _build/src/financial-engine.{css,html,js}, assets/financial-engine-hero.webp
// Outputs: financial-engine.ghl.html (hosted image URL) and financial-engine.inline.ghl.html (embedded image)
// Nothing in _build/ is needed at runtime.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = '#bwci-financial-engine';
const PAGE_DIR = path.resolve(__dirname, '..');
const SRC = path.join(__dirname, 'src');
const IMAGE = path.join(PAGE_DIR, 'assets', 'financial-engine-hero.webp');
const PLACEHOLDER = 'REPLACE_WITH_HOSTED_IMAGE_URL';

/* ---------------- CSS scoping ---------------- */
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
// index of the next `stop` char at depth 0 (outside quotes / parens / brackets)
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
const imports = [];
const keyframeNames = [];
function processBlock(css, indent) {
  let out = '', i = 0;
  while (i < css.length) {
    while (i < css.length && /\s/.test(css[i])) i++;
    if (i >= css.length) break;
    if (css[i] === '@') {
      const name = /^@[\w-]+/.exec(css.slice(i))[0];
      if (name === '@import') {
        const end = scanTo(css, i, [';']);
        imports.push(css.slice(i, end + 1).trim());
        i = end + 1; continue;
      }
      const open = scanTo(css, i, ['{']);
      const close = matchBrace(css, open);
      const prelude = css.slice(i, open).trim().replace(/\s+/g, ' ');
      if (/^@(-webkit-)?keyframes/.test(name)) {
        const kf = prelude.split(' ')[1];
        if (!kf.startsWith('fe-')) throw new Error('Keyframes must be fe- namespaced: ' + kf);
        keyframeNames.push(kf);
        const body = css.slice(open + 1, close).replace(/\s+/g, ' ').trim();
        out += indent + prelude + '{ ' + body + ' }\n';
      } else {
        out += indent + prelude + '{\n' + processBlock(css.slice(open + 1, close), indent + '  ') + indent + '}\n';
      }
      i = close + 1; continue;
    }
    const open = scanTo(css, i, ['{']);
    if (open === -1) throw new Error('Dangling CSS: ' + css.slice(i, i + 80));
    const close = matchBrace(css, open);
    const selectors = splitSelectors(css.slice(i, open)).map(scopeSelector);
    const body = css.slice(open + 1, close).replace(/\s+/g, ' ').trim();
    out += indent + selectors.join(', ') + '{ ' + body + ' }\n';
    i = close + 1;
  }
  return out;
}

const cssSrc = fs.readFileSync(path.join(SRC, 'financial-engine.css'), 'utf8');
const scoped = processBlock(stripComments(cssSrc), '');
// every selector line must be scoped
scoped.split('\n').forEach((line) => {
  const t = line.trim();
  if (!t || t === '}' || t.startsWith('@') || /^(from|to|\d+%)/.test(t)) return;
  const sel = t.slice(0, t.indexOf('{'));
  splitSelectors(sel).forEach((s) => { if (!s.startsWith(ROOT)) throw new Error('Unscoped selector: ' + s); });
});
const css = imports.join('\n') + '\n' + scoped;

/* ---------------- HTML + JS ---------------- */
const html = fs.readFileSync(path.join(SRC, 'financial-engine.html'), 'utf8').trim();
const js = fs.readFileSync(path.join(SRC, 'financial-engine.js'), 'utf8').trim();
if (!js.includes('__FE_IMAGE_URL__')) throw new Error('JS image placeholder missing');
// markup sanity: no project-relative / Claude Design references may survive
// (comments are ignored: they may legitimately name the source files)
const htmlCode = html.replace(/<!--[\s\S]*?-->/g, '');
const jsCode = js.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
[/\.dc\.html/, /\.\/assets\//, /\/vendor\//, /support\.js/, /localhost/, /file:\/\//, /\{\{/].forEach((re) => {
  if (re.test(htmlCode) || re.test(jsCode) || re.test(scoped)) throw new Error('Forbidden reference ' + re + ' in output');
});

function banner(variant) {
  return [
    '<!--',
    '  BWCI — THE FINANCIAL ENGINE · GoHighLevel Custom Code block (' + variant + ')',
    '  Source: FinancialEngine.dc.html (+ SiteHeader.dc.html) · generated by ghl/pages/financial-engine/_build/build.js',
    '  Paste this whole file into ONE GoHighLevel "Custom Code" element placed in a full-width section with no padding.',
    '  Configuration lives at the top of the <script>: ASSETS (hero image URL), ROUTES (page links), OPTIONS.',
    '  Root toggles: data-show-header / data-show-footer on #bwci-financial-engine.',
    '-->',
  ].join('\n');
}
function assemble(imageValue, variant) {
  const script = js.replace('__FE_IMAGE_URL__', imageValue);
  return banner(variant) + '\n<style>\n' + css + '</style>\n\n' + html + '\n\n<script>\n' + script + '\n</script>\n';
}

const ghl = assemble(PLACEHOLDER, 'production — hosted image');
const dataUri = 'data:image/webp;base64,' + fs.readFileSync(IMAGE).toString('base64');
const inline = assemble(dataUri, 'self-contained — embedded image');

fs.writeFileSync(path.join(PAGE_DIR, 'financial-engine.ghl.html'), ghl);
fs.writeFileSync(path.join(PAGE_DIR, 'financial-engine.inline.ghl.html'), inline);
console.log('keyframes:', keyframeNames.join(', '));
console.log('financial-engine.ghl.html        ', (Buffer.byteLength(ghl) / 1024).toFixed(1) + ' KB');
console.log('financial-engine.inline.ghl.html ', (Buffer.byteLength(inline) / 1024).toFixed(1) + ' KB');
