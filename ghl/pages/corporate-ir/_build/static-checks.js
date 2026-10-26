#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const chromePath = path.resolve(__dirname, '../../../shared/site-chrome/site-chrome.js');
const chrome = require(chromePath);
assert.equal(chrome.HREF_KEYS['Main.dc.html#impact'], 'impact');
assert.equal(chrome.LINK_DEFAULTS.impact, '/#bwci-impact');
assert.equal(chrome.HREF_KEYS['Better%20World%20Impact.dc.html'], 'betterWorldImpact');
assert.equal(chrome.LINK_DEFAULTS.betterWorldImpact, '#');
const generated = chrome({prefix:'cir',current:'ir',breadcrumb:'ir',content:true,rename:n=>'cir-'+n});
assert(generated.header.includes('data-cir-link="betterWorldImpact"'));
assert(generated.footer.includes('data-cir-link="betterWorldImpact"'));
assert(!generated.header.includes('data-cir-link="impact"'));
// Exercise the guard with an in-memory source fixture; never modify design/ to test it.
const injectedFS = Object.create(fs);
injectedFS.readFileSync = function (file, encoding) {
  const body = fs.readFileSync(file, encoding);
  return String(file).endsWith('SiteHeader.dc.html')
    ? body.replace('Better%20World%20Impact.dc.html', 'Unknown%20Destination.dc.html') : body;
};
const moduleFixture = {exports:{}};
const wrapper = vm.runInThisContext('(function(require,module,exports,__dirname){' + fs.readFileSync(chromePath,'utf8') + '\n})');
wrapper(n=>n==='fs'?injectedFS:require(n),moduleFixture,moduleFixture.exports,path.dirname(chromePath));
assert.throws(()=>moduleFixture.exports({prefix:'test',current:'ir'}),/Design href without a config link key: Unknown/);
const pageDir = path.resolve(__dirname,'..');
for (const variant of ['corporate-ir.ghl.html','corporate-ir.inline.ghl.html']) {
  const html = fs.readFileSync(path.join(pageDir,variant),'utf8');
  const config=JSON.parse(html.match(/<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/)[1]);
  const runtime=html.slice(html.lastIndexOf('<script>')+8,html.lastIndexOf('</script>'));
  new vm.Script(runtime); // delivered JS must be browser-ready, without a compile step
  const markup=html.slice(html.indexOf('<div id="bwci-corporate-ir"'),html.lastIndexOf('<script>'));
  const runtimeCode=runtime.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
  assert(!/\.dc\.html|support\.js|React\.|<sc-|<x-dc|<dc-import/.test(markup+runtimeCode));
  assert(!/href="#(?:company-information|reports-documents|shareholders|regulatory|legal-notices)"/.test(markup));
  for(const m of markup.matchAll(/class="([^"]*)"/g))assert(m[1].split(/\s+/).every(c=>c.startsWith('cir-')),'Unprefixed class '+m[1]);
  for(const m of markup.matchAll(/data-cir-link="([^"]+)"/g))assert(Object.hasOwn(config.links,m[1]),m[1]);
  for(const key of ['corporateIR','corporateIRCompanyInformation','corporateIRReportsDocuments','corporateIRShareholders','corporateIRRegulatory','corporateIRLegalNotices','betterWorldImpact','announcements','verifyPhone','verifyEmail','irEmail','secretaryEmail'])assert.equal(config.links[key],'#');
  assert.equal((markup.match(/<main\b/g)||[]).length,1);
  assert.equal((markup.match(/<h1\b/g)||[]).length,1);
}
console.log('PASS standalone blocks, independent routes, namespacing, safe placeholder defaults, Impact compatibility and unknown-link guard');
