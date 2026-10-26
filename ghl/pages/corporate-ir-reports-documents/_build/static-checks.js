#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const page=path.resolve(__dirname,'..');
const chrome=require('../../../shared/site-chrome/site-chrome');
const source=fs.readFileSync(path.resolve(__dirname,'../../../../design/Corporate IR.dc.html'),'utf8');
const docs=new Function(source.slice(source.indexOf('const ROUTES ='),source.indexOf('const readRoute ='))+'return DOCS;')();
assert(fs.readFileSync(path.resolve(__dirname,'../../../shared/site-chrome/assets/bwci-logo.png')).equals(fs.readFileSync(path.resolve(__dirname,'../../../../design/assets/bwci-logo.png'))));
const c=chrome({prefix:'cid',current:'ir',breadcrumb:'ir',label:'Reports & documents',content:true,rename:n=>'cid-'+n});
assert(c.breadcrumb.includes('Reports &amp; documents'));assert(c.breadcrumb.includes('data-cid-link="corporateIR"'));
assert.equal((c.breadcrumb.match(/<li /g)||[]).length,3);
for(const variant of ['corporate-ir-reports-documents.ghl.html','corporate-ir-reports-documents.inline.ghl.html']){
  const html=fs.readFileSync(path.join(page,variant),'utf8');
  const cfg=JSON.parse(html.match(/<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/)[1]);
  assert.equal(cfg.documents,'Published');assert.equal(cfg.showFlags,true);assert(!Object.hasOwn(cfg,'showGroup'));
  assert.deepEqual(cfg.reportDocuments,docs.map(d=>({title:d.t,type:d.type,year:d.yr,published:d.d,file:d.f,url:'#',unconfirmed:true})));
  const markup=html.slice(html.indexOf('<div id="bwci-corporate-ir-reports-documents"'),html.lastIndexOf('<script>'));
  const runtime=html.slice(html.lastIndexOf('<script>')+8,html.lastIndexOf('</script>'));
  new vm.Script(runtime);
  const code=runtime.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
  assert(!/\.dc\.html|support\.js|React\.|<sc-|<x-dc|<dc-import/.test(markup+code));
  assert(!/href="#(?:company-information|reports-documents|shareholders|regulatory|legal-notices)"/.test(markup));
  assert.equal((markup.match(/<main\b/g)||[]).length,1);assert.equal((markup.match(/<h1\b/g)||[]).length,1);
  for(const m of markup.matchAll(/class="([^"]*)"/g))assert(m[1].split(/\s+/).every(c=>c.startsWith('cid-')),m[1]);
  for(const m of markup.matchAll(/data-cid-link="([^"]+)"/g))assert(Object.hasOwn(cfg.links,m[1]),m[1]);
  for(const key of ['corporateIR','corporateIRCompanyInformation','corporateIRReportsDocuments','corporateIRShareholders','corporateIRRegulatory','corporateIRLegalNotices','betterWorldImpact'])assert.equal(cfg.links[key],'#');
}
// Exercise build-time JSON embedding without changing input files or writing generated outputs.
const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'src/corporate-ir-reports-documents.config.json'),'utf8'));
const payload='</script><img src=x onerror="window.__cidInjected=true">';
fixture.reportDocuments[0].title=payload;
const memoryFS=Object.create(fs),written=new Map();
memoryFS.readFileSync=function(file,encoding){return String(file).endsWith('corporate-ir-reports-documents.config.json')?JSON.stringify(fixture):fs.readFileSync(file,encoding);};
memoryFS.writeFileSync=function(file,body){written.set(path.basename(file),body);};
const build=vm.runInThisContext('(function(require,__dirname,process,console){'+fs.readFileSync(path.join(__dirname,'build.js'),'utf8').replace(/^#![^\n]*\n/,'')+'\n})');
build(n=>n==='fs'?memoryFS:require(n),__dirname,{argv:[]},{log(){}});
assert.equal(written.size,2);
for(const block of written.values()){
  const json=block.match(/<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/)[1];
  assert(!json.includes('</script>'));assert(json.includes('\\u003c/script>'));
  assert.equal(JSON.parse(json).reportDocuments[0].title,payload);
}
console.log('PASS source placeholder metadata, safe download defaults, independent routes, scoped standalone blocks, JS parsing, supplied logo and labelled breadcrumb');
