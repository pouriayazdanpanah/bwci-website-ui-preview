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
  assert.deepEqual(cfg.evidence,[]);assert.deepEqual(cfg.cases,[]);assert(!Object.hasOwn(cfg,'showGroup'));assert(!Object.hasOwn(cfg,'documents'));assert(!Object.hasOwn(cfg,'reportDocuments'));
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
  // Export 141ee23: static engine figure (no controls), the design's five new sections and every source text verbatim.
  assert(!/data-bwi-engine-(?:step|prev|next|details|count)|bwi-lp-tag|<button[^>]*bwi-lp-n/.test(markup));
  assert.equal((markup.match(/class="bwi-lp bwi-lp--static" role="img"/g)||[]).length,1);assert.equal((markup.match(/class="bwi-lp-n"/g)||[]).length,6);
  for(const id of ['bwi-regeneration','bwi-approach','bwi-engine','bwi-returns','bwi-measure'])assert(markup.includes('id="'+id+'"'),id);
  assert.equal(cfg.reviewFlags,false);assert.equal(cfg.approachCopy,'current site copy');assert.equal(cfg.engineSupportingCopy,'');assert(!Object.hasOwn(cfg,'showMethodology'));
  const source=fs.readFileSync(path.resolve(__dirname,'../../../../design/Better World Impact.dc.html'),'utf8');
  const main=source.slice(source.indexOf('<!-- 02 '),source.indexOf('<sc-if value="{{ hasEvidence }}"')).replace(/<sc-for[\s\S]*?<\/sc-for>/,'');
  const texts=[...main.matchAll(/>([^<>{}]+)</g)].map(m=>m[1].trim()).filter(t=>t&&!/^\[Explanation/.test(t));
  for(const t of texts)assert(markup.includes('>'+t+'<')||markup.includes(t),'Source text preserved: '+t);
  const mom=vm.runInNewContext(source.match(/const MOM = (\[[\s\S]*?\n    \]);/)[1]);
  for(const [w,text] of mom){assert(markup.includes('>'+w+'<'));assert(markup.includes(text),'Approach copy: '+w);}
  assert(code.includes("'[Explanation to come: what we do when capital is ' + w + '. Final copy may run to two or three sentences.]'"));
  assert.match(cfg.links.financialEngineHero,/#fe-hero$/);
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
console.log('PASS Impact-only blocks, empty launch data, static engine figure/source section text, independent routes, unique prefixes, JS syntax, logo/breadcrumb and escaped JSON');
