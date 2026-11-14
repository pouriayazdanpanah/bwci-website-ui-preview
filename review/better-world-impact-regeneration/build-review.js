#!/usr/bin/env node
// Dev-only: builds the Better World & Impact REVIEW PROTOTYPE. Nothing here is a GoHighLevel deliverable and nothing in
// ghl/ or design/ is changed.
//   node review/better-world-impact-regeneration/build-review.js
// It runs the page's own build (ghl/pages/better-world-impact/_build/build.js) with three in-memory substitutions, so
// the header, hero, closing CTA, footer, styles, scoping, motion and runtime are exactly the current port's:
//   1. page markup: everything between the hero and the closing CTA ("Our approach", "Financial Engine", methodology,
//      evidence, case studies) is replaced with src/sections.html; its engine marker receives the existing Financial
//      Engine component from the port, without its "Impact considered" stage tags;
//   2. page CSS: src/sections.css is appended;
//   3. outputs: kept in memory instead of being written over the production blocks.
// out/prototype.html wraps the self-contained (inline-image) block in a plain HTML document for viewing.
'use strict';
const fs = require('fs');
const path = require('path');
const HERE = __dirname;
const REPO = path.resolve(HERE, '../..');
const PORT = path.join(REPO, 'ghl/pages/better-world-impact');
const SRC = path.join(PORT, '_build/src');
const OUT = path.join(HERE, 'out');
fs.mkdirSync(OUT, { recursive: true });

const portHtml = fs.readFileSync(path.join(SRC, 'better-world-impact.html'), 'utf8');
const sections = fs.readFileSync(path.join(HERE, 'src/sections.html'), 'utf8');
const sectionsCss = fs.readFileSync(path.join(HERE, 'src/sections.css'), 'utf8');
const one = (hay, needle) => { const n = hay.split(needle).length - 1; if (n !== 1) throw new Error('expected one match, found ' + n + ': ' + needle.slice(0, 80)); return hay.indexOf(needle); };

// the existing Financial Engine component: from the loop to the end of its detail card, inside the engine section
const eStart = one(portHtml, '<div class="bwi-lp" data-bwi-engine-loop');
const eSecEnd = portHtml.indexOf('</section>', eStart);
const eEnd = portHtml.lastIndexOf('</div>', portHtml.lastIndexOf('</div>', eSecEnd) - 1) + '</div>'.length; // keep the wrap's own </div> out
let engine = '        ' + portHtml.slice(eStart, eEnd).trim();
const tags = (engine.match(/<span class="bwi-lp-tag">Impact considered<\/span>/g) || []).length;
if (tags !== 3) throw new Error('expected 3 "Impact considered" tags, found ' + tags);
engine = engine.replace(/\n\s*<span class="bwi-lp-tag">Impact considered<\/span>/g, '');
if (!/data-bwi-link="financialEngineHero"/.test(engine)) throw new Error('engine link missing');

const a = one(portHtml, '    <section class="bwi-sec" id="bwi-approach"');
const b = one(portHtml, '    <section class="bwi-section" id="bwi-next"');
const html = portHtml.slice(0, a) + sections.replace('<!--engine-->', () => engine).trim() + '\n\n' + portHtml.slice(b);

// run the port's build with the substitutions
const realRead = fs.readFileSync, realWrite = fs.writeFileSync;
const written = {};
fs.readFileSync = function (p, enc) {
  const f = path.resolve(String(p));
  if (f === path.join(SRC, 'better-world-impact.html')) return html;
  if (f === path.join(SRC, 'better-world-impact.css')) return realRead.call(fs, f, 'utf8') + '\n' + sectionsCss;
  return realRead.apply(fs, arguments);
};
fs.writeFileSync = function (p, data) {
  const f = path.resolve(String(p));
  if (f.startsWith(PORT + path.sep)) { written[path.basename(f)] = data; return undefined; } // kept in memory: not GHL deliverables
  return realWrite.apply(fs, arguments);
};
process.argv = process.argv.slice(0, 2); // the regular (non-global) variants only
require(path.join(PORT, '_build/build.js'));
fs.readFileSync = realRead; fs.writeFileSync = realWrite;

const inline = written['better-world-impact.inline.ghl.html'];
if (!inline) throw new Error('inline block not produced');
const doc = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
  '<title>Better World &amp; Impact (review prototype)</title>\n<meta name="robots" content="noindex, nofollow">\n</head>\n<body style="margin:0">\n' +
  '<!-- REVIEW PROTOTYPE, NOT FOR PUBLICATION. Review notes: review/better-world-impact-regeneration/REVIEW-NOTES.md -->\n' +
  inline + '</body>\n</html>\n';
realWrite.call(fs, path.join(OUT, 'prototype.html'), doc);
console.log('review prototype built:', path.relative(REPO, path.join(OUT, 'prototype.html')), Math.round(doc.length / 1024) + ' KB');
