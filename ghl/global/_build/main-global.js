#!/usr/bin/env node
// Dev-only: derives Main's blocks for the global header and footer from the two hand-edited Main outputs.
//   node ghl/global/_build/main-global.js
// Inputs : ghl/pages/main/main.ghl.html and main.inline.ghl.html (edited by hand; they stay the source of truth)
// Outputs: ghl/pages/main/main.global.ghl.html and main.global.inline.ghl.html
// The same transformation as a page build's --global: the header and footer markup and their CSS are removed, the
// logo / header / footer settings and the header-only links leave the config, the header-less runtime leaves
// --util-h / --nav-h to the global header and announces the page ("bwci:page-ready"), and the root is marked
// data-bwci-current="home" plus data-bwci-under-header (Main's hero is pulled up under the header, so the global
// header keeps its placeholder transparent). Every step checks that it changed exactly what it expects.
'use strict';
const { GLOBAL_HEADERLESS } = require('../../shared/site-chrome/site-chrome');
const fs = require('fs');
const path = require('path');
const DIR = path.resolve(__dirname, '../../pages/main');

const once = (s, a, b, what) => {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error('Main changed (' + what + '): expected 1 match, found ' + n);
  return s.replace(a, () => b);
};
function cut(s, start, end, what) {
  const i = s.indexOf(start); const j = s.indexOf(end, i);
  if (i < 0 || j < 0 || s.indexOf(start, i + 1) >= 0) throw new Error('Main changed (' + what + ')');
  return s.slice(0, i) + s.slice(j + end.length);
}

function derive(src) {
  let s = src;
  // banner
  s = once(s, '<!--\n', '<!--\n' +
    '  FOR THE GLOBAL HEADER AND FOOTER (derived by ghl/global/_build/main-global.js): this block has NO header or footer\n' +
    '  of its own. Paste it between the "BWCI Header" and "BWCI Footer" GoHighLevel Global Sections (ghl/global/). The\n' +
    '  logo, header/footer and footer-wording settings live in those sections; any such setting named below is not here.\n', 'banner');

  // markup: header host, footer host
  s = cut(s, '  <div class="bw-hdr-host" data-bw-hdr-host>\n', '</header>\n</div>\n', 'header markup');
  // the footer host closes just before the root: "</footer>\n</div></div>" — keep the root's closing </div>
  s = cut(s, '  <div class="bw-sft-host" data-bw-footer>\n', '</footer>\n</div>', 'footer markup');
  const markup = s.slice(s.indexOf('</style>'), s.indexOf('\n<script>', s.indexOf('</style>')));
  if (/data-bw-hdr|data-bw-footer|class="bw-sft|<header|<footer/.test(markup)) throw new Error('header/footer markup left in Main');

  // root: current page, and content under the header
  s = once(s, '<div id="bwci-main-page">', '<div id="bwci-main-page" data-bwci-current="home" data-bwci-under-header>', 'root');

  // CSS: the header and footer rules are the last part of the style block
  const cssStart = s.indexOf('#bwci-main-page .bw-hdr-host{'); const cssEnd = s.indexOf('</style>', cssStart);
  if (cssStart < 0 || cssEnd < 0) throw new Error('Main changed (chrome CSS)');
  const removed = s.slice(cssStart, cssEnd);
  if (/bw-(hero|slot|cta|lpd)|\.hm\b/.test(removed.replace(/\.bw-(hdr|sft)[\w-]*/g, ''))) throw new Error('page CSS inside the removed header/footer CSS');
  s = s.slice(0, cssStart) + s.slice(cssEnd);

  // runtime: as site-chrome's `global` option
  s = once(s, "if (!hdr) { root.style.setProperty('--util-h', '0px'); root.style.setProperty('--nav-h', '0px'); return { destroy: removeStatus }; }",
    GLOBAL_HEADERLESS, 'runtime reset');
  s = once(s, 'function siteChrome(root, cfg, on, timers) {', "function siteChrome(root, cfg, on, timers) {\n    if (root.hasAttribute('data-bwci-current')) { try { document.dispatchEvent(new CustomEvent('bwci:page-ready')); } catch (err) { /* old browser */ } }", 'runtime start');

  // config: drop the header/footer settings and the links only the header and footer used
  const m = /(<script type="application\/json" id="bwci-main-config">\n)([\s\S]*?)(\n<\/script>)/.exec(s);
  if (!m) throw new Error('Main changed (config)');
  const cfg = JSON.parse(m[2]);
  ['logoImage', 'showHeader', 'showFooter', 'footer'].forEach((k) => { if (!(k in cfg)) throw new Error('config key missing: ' + k); delete cfg[k]; });
  if (cfg.imageFallbacks) delete cfg.imageFallbacks.logoImage;
  const used = new Set([...s.matchAll(/data-bw-link="([^"]+)"/g)].map((x) => x[1]));
  Object.keys(cfg.links).forEach((k) => { if (!used.has(k)) delete cfg.links[k]; });
  used.forEach((k) => { if (!(k in cfg.links)) throw new Error('link key without config: ' + k); });
  s = s.slice(0, m.index) + m[1] + JSON.stringify(cfg, null, 2) + m[3] + s.slice(m.index + m[0].length);
  return s;
}

for (const [from, to] of [['main.ghl.html', 'main.global.ghl.html'], ['main.inline.ghl.html', 'main.global.inline.ghl.html']]) {
  const out = derive(fs.readFileSync(path.join(DIR, from), 'utf8'));
  fs.writeFileSync(path.join(DIR, to), out);
  console.log(to.padEnd(28), (Buffer.byteLength(out) / 1024).toFixed(1) + ' KB');
}
