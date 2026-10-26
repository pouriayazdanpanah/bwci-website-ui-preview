#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const page=path.resolve(__dirname,'..');
const chrome=require('../../../shared/site-chrome/site-chrome');
assert(fs.readFileSync(path.resolve(__dirname,'../../../shared/site-chrome/assets/bwci-logo.png')).equals(fs.readFileSync(path.resolve(__dirname,'../../../../design/assets/bwci-logo.png'))));
const c=chrome({prefix:'bwi',current:'impact',breadcrumb:'impact',content:true,rename:n=>'bwi-'+n});
assert(c.breadcrumb.includes('Better World &amp; Impact'));
assert.equal((c.breadcrumb.match(/<li /g)||[]).length,2);
for(const variant of ['better-world-impact.ghl.html','better-world-impact.inline.ghl.html']){
  const html=fs.readFileSync(path.join(page,variant),'utf8');
  const cfg=JSON.parse(html.match(/<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/)[1]);
  assert.equal(cfg.showMethodology,true);assert.deepEqual(cfg.evidence,[]);assert.deepEqual(cfg.cases,[]);assert(!Object.hasOwn(cfg,'showGroup'));assert(!Object.hasOwn(cfg,'documents'));assert(!Object.hasOwn(cfg,'reportDocuments'));
  const markup=html.slice(html.indexOf('<div id="bwci-better-world-impact"'),html.lastIndexOf('<script>'));
  const runtime=html.slice(html.lastIndexOf('<script>')+8,html.lastIndexOf('</script>'));
  new vm.Script(runtime);
  const code=runtime.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
  assert(!/\.dc\.html|support\.js|React\.|<sc-|<x-dc|<dc-import/.test(markup+code));
  assert(!/href="#(?:company-information|reports-documents|shareholders|regulatory|legal-notices)"/.test(markup));
  assert(!/href="mailto:(?:ir|cosec)@domain"/.test(markup));
  assert.equal((markup.match(/<main\b/g)||[]).length,1);assert.equal((markup.match(/<h1\b/g)||[]).length,1);
  for(const m of markup.matchAll(/class="([^"]*)"/g))assert(m[1].split(/\s+/).every(c=>c.startsWith('bwi-')),m[1]);
  for(const m of markup.matchAll(/data-bwi-link="([^"]+)"/g))assert(Object.hasOwn(cfg.links,m[1]),m[1]);
  assert.equal((markup.match(/data-bwi-engine-step=/g)||[]).length,6);
  assert.equal((markup.match(/class="bwi-lp-tag"/g)||[]).length,3);
  assert(!markup.includes('bwi-lp--static'));
  for(let i=1;i<=6;i++)for(const kind of ['step','panel','mobile'])assert(markup.includes('id="bwi-engine-'+kind+'-'+i+'"'));
  assert.equal((markup.match(/data-bwi-engine-prev/g)||[]).length,1);assert.equal((markup.match(/data-bwi-engine-next/g)||[]).length,1);
  const source=fs.readFileSync(path.resolve(__dirname,'../../../../design/Better World Impact.dc.html'),'utf8');
  const steps=vm.runInNewContext(source.match(/const STEPS = (\[[\s\S]*?\n    \]);/)[1]);
  const escape=v=>v.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
  for(const step of steps)for(const value of step)assert(markup.includes(escape(value)),'Original step content preserved: '+value);
  assert.equal(cfg.links.contact,'#');assert.equal(cfg.links.betterWorldImpact,'#');assert.equal(cfg.links.financialEngineHero,'/financial-engine#fe-hero');

}
// Verify safe JSON embedding without editing source settings or writing fixture outputs.
const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'src/better-world-impact.config.json'),'utf8'));
assert(fs.readFileSync(path.resolve(__dirname,'../assets/impact-hero-ribbons.png')).equals(fs.readFileSync(path.resolve(__dirname,'../../../../design/assets/impact-hero-ribbons.png'))));
const payload='</script><img src=x onerror="window.__bwiInjected=true">';fixture.footer.registeredOffice=payload;
const memoryFS=Object.create(fs),written=new Map();
memoryFS.readFileSync=function(file,encoding){return String(file).endsWith('better-world-impact.config.json')?JSON.stringify(fixture):fs.readFileSync(file,encoding);};
memoryFS.writeFileSync=function(file,body){written.set(path.basename(file),body);};
const build=vm.runInThisContext('(function(require,__dirname,process,console){'+fs.readFileSync(path.join(__dirname,'build.js'),'utf8').replace(/^#![^\n]*\n/,'')+'\n})');
build(n=>n==='fs'?memoryFS:require(n),__dirname,{argv:[]},{log(){}});assert.equal(written.size,2);
for(const block of written.values()){
  const json=block.match(/<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/)[1];
  assert(!json.includes('</script>'));assert(json.includes('\\u003c/script>'));assert.equal(JSON.parse(json).footer.registeredOffice,payload);
}
console.log('PASS Impact-only blocks, empty launch data, six-stage controls/source step content, independent routes, unique prefixes, JS syntax, logo/breadcrumb and escaped JSON');
