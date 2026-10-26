#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const page=path.resolve(__dirname,'..');
const chrome=require('../../../shared/site-chrome/site-chrome');
assert(fs.readFileSync(path.resolve(__dirname,'../../../shared/site-chrome/assets/bwci-logo.png')).equals(fs.readFileSync(path.resolve(__dirname,'../../../../design/assets/bwci-logo.png'))));
const c=chrome({prefix:'cis',current:'ir',breadcrumb:'ir',label:'Shareholder information',content:true,rename:n=>'cis-'+n});
assert(c.breadcrumb.includes('Shareholder information'));assert(c.breadcrumb.includes('data-cis-link="corporateIR"'));
assert.equal((c.breadcrumb.match(/<li /g)||[]).length,3);
for(const variant of ['corporate-ir-shareholders.ghl.html','corporate-ir-shareholders.inline.ghl.html']){
  const html=fs.readFileSync(path.join(page,variant),'utf8');
  const cfg=JSON.parse(html.match(/<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/)[1]);
  assert.equal(cfg.showFlags,true);assert(!Object.hasOwn(cfg,'showGroup'));assert(!Object.hasOwn(cfg,'documents'));assert(!Object.hasOwn(cfg,'reportDocuments'));
  const markup=html.slice(html.indexOf('<div id="bwci-corporate-ir-shareholders"'),html.lastIndexOf('<script>'));
  const runtime=html.slice(html.lastIndexOf('<script>')+8,html.lastIndexOf('</script>'));
  new vm.Script(runtime);
  const code=runtime.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
  assert(!/\.dc\.html|support\.js|React\.|<sc-|<x-dc|<dc-import/.test(markup+code));
  assert(!/href="#(?:company-information|reports-documents|shareholders|regulatory|legal-notices)"/.test(markup));
  assert(!/href="mailto:(?:ir|cosec)@domain"/.test(markup));
  assert.equal((markup.match(/<main\b/g)||[]).length,1);assert.equal((markup.match(/<h1\b/g)||[]).length,1);
  for(const m of markup.matchAll(/class="([^"]*)"/g))assert(m[1].split(/\s+/).every(c=>c.startsWith('cis-')),m[1]);
  for(const m of markup.matchAll(/data-cis-link="([^"]+)"/g))assert(Object.hasOwn(cfg.links,m[1]),m[1]);
  for(const key of ['corporateIR','corporateIRCompanyInformation','corporateIRReportsDocuments','corporateIRShareholders','corporateIRRegulatory','corporateIRLegalNotices','betterWorldImpact','shareholderMeetingNotice','shareholderMeetingResults','irEmail'])assert.equal(cfg.links[key],'#');
}
// Verify safe JSON embedding without editing source settings or writing fixture outputs.
const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'src/corporate-ir-shareholders.config.json'),'utf8'));
const payload='</script><img src=x onerror="window.__cisInjected=true">';fixture.footer.registeredOffice=payload;
const memoryFS=Object.create(fs),written=new Map();
memoryFS.readFileSync=function(file,encoding){return String(file).endsWith('corporate-ir-shareholders.config.json')?JSON.stringify(fixture):fs.readFileSync(file,encoding);};
memoryFS.writeFileSync=function(file,body){written.set(path.basename(file),body);};
const build=vm.runInThisContext('(function(require,__dirname,process,console){'+fs.readFileSync(path.join(__dirname,'build.js'),'utf8').replace(/^#![^\n]*\n/,'')+'\n})');
build(n=>n==='fs'?memoryFS:require(n),__dirname,{argv:[]},{log(){}});assert.equal(written.size,2);
for(const block of written.values()){
  const json=block.match(/<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/)[1];
  assert(!json.includes('</script>'));assert(json.includes('\\u003c/script>'));assert.equal(JSON.parse(json).footer.registeredOffice,payload);
}
console.log('PASS Shareholders-only blocks, safe file/email defaults, independent routes, unique prefixes, JS syntax, logo/breadcrumb and escaped JSON');
