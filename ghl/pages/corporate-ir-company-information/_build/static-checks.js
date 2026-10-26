#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const page=path.resolve(__dirname,'..');
const chrome=require('../../../shared/site-chrome/site-chrome');
assert(fs.readFileSync(path.resolve(__dirname,'../../../shared/site-chrome/assets/bwci-logo.png')).equals(fs.readFileSync(path.resolve(__dirname,'../../../../design/assets/bwci-logo.png'))),'Supplied logo differs');
const labelled=chrome({prefix:'cic',current:'ir',breadcrumb:'ir',label:'Company information',content:true,rename:n=>'cic-'+n});
assert(labelled.breadcrumb.includes('data-cic-link="corporateIR"'));
assert(labelled.breadcrumb.includes('Company information'));
assert.equal((labelled.breadcrumb.match(/<li /g)||[]).length,3);
assert.equal(chrome.HREF_KEYS['Main.dc.html#impact'],'impact');
assert.equal(chrome.LINK_DEFAULTS.impact,'/#bwci-impact');
assert.equal(chrome.HREF_KEYS['Better%20World%20Impact.dc.html'],'betterWorldImpact');
assert.equal(chrome.LINK_DEFAULTS.betterWorldImpact,'#');
for(const name of ['corporate-ir-company-information.ghl.html','corporate-ir-company-information.inline.ghl.html']){
  const block=fs.readFileSync(path.join(page,name),'utf8');
  const config=JSON.parse(block.match(/<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/)[1]);
  assert.equal(config.showGroup,true);assert.equal(config.showFlags,true);
  assert(!Object.hasOwn(config,'documents'));
  const markup=block.slice(block.indexOf('<div id="bwci-corporate-ir-company-information"'),block.lastIndexOf('<script>'));
  const runtime=block.slice(block.lastIndexOf('<script>')+8,block.lastIndexOf('</script>'));
  new vm.Script(runtime);
  const code=runtime.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
  assert(!/\.dc\.html|support\.js|React\.|<sc-|<x-dc|<dc-import/.test(markup+code));
  assert(!/href="#(?:company-information|reports-documents|shareholders|regulatory|legal-notices)"/.test(markup));
  assert.equal((markup.match(/<main\b/g)||[]).length,1);
  assert.equal((markup.match(/<h1\b/g)||[]).length,1);
  for(const m of markup.matchAll(/class="([^"]*)"/g))assert(m[1].split(/\s+/).every(c=>c.startsWith('cic-')),m[1]);
  for(const m of markup.matchAll(/data-cic-link="([^"]+)"/g))assert(Object.hasOwn(config.links,m[1]),m[1]);
  for(const key of ['corporateIR','corporateIRCompanyInformation','corporateIRReportsDocuments','corporateIRShareholders','corporateIRRegulatory','corporateIRLegalNotices','governanceBoard','betterWorldImpact'])assert.equal(config.links[key],'#');
}
console.log('PASS Company-only standalone blocks, JS syntax, unique namespacing, group config, independent destinations and labelled breadcrumb');
