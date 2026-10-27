#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const links=require('..'),common=require('../../site-chrome/qa/sync/common');
const baseline=process.argv[2]||'/tmp/bwci-links-baseline/ghl/pages',out=path.join(__dirname,'output');fs.mkdirSync(out,{recursive:true});
const rows=[],pages=[],notes=[],cfgRE=/(<script type="application\/json" id="([^"]+)">)([\s\S]*?)(<\/script>)/;
const markup=s=>s.slice(s.indexOf('</style>')+8,s.lastIndexOf('<script>')).replace(/<(?:a|option)\b[^>]*data-[\w-]+-link="[^"]+"[^>]*>/g,tag=>tag.replace(/\b(href|value)="[^"]*"/g,'$1="CONFIGURED"'));
for(const row of common.manifest()){
 for(const kind of ['inline','hosted']){
  const current=common.block(row.slug,kind),before=common.block(row.slug,kind,baseline),a=common.parse(before),b=common.parse(current);
  assert.equal(a.config,b.config);assert.equal(a.root,b.root);assert.equal(a.owner,b.owner);assert.equal(a.prefix,b.prefix);
  assert.deepEqual(Object.keys(a.cfg.links),Object.keys(b.cfg.links));
  const oldCfg={...a.cfg},newCfg={...b.cfg};delete oldCfg.links;delete newCfg.links;assert.deepEqual(oldCfg,newCfg,row.slug+' original images/non-link settings');
  assert.equal(before.match(/<style>([\s\S]*?)<\/style>/)[1],current.match(/<style>([\s\S]*?)<\/style>/)[1],row.slug+' exact CSS');
  assert.equal(markup(before),markup(current),row.slug+' exact structure/content apart from configured destinations');
  new vm.Script(b.runtime);assert.equal((b.runtime.match(/siteResolveLinks\(cfg\);/g)||[]).length,1);
  if(row.slug==='main'){
   const strip=(s,marker)=>{const start=s.indexOf(marker),end=s.indexOf('  /* ---------------------------------------------------------------- */',start);assert(start>0&&end>start);return s.slice(0,start)+s.slice(end);};
   const old=strip(a.runtime,'/* ======================= SHARED SITE CHROME');
   const current=strip(b.runtime,'/* Resolve page-section links').replace('    siteResolveLinks(cfg);\n','').replace("function href() { return typeof links.platformsDirectory === 'string' && links.platformsDirectory ? links.platformsDirectory : '#'; }","function href() { return typeof links.platformsDirectory === 'string' && links.platformsDirectory ? links.platformsDirectory : '/platforms#plt-directory'; }");
   assert.equal(current,old,'Main unrelated runtime unchanged');
  }
  for(const [key,value]of Object.entries(b.cfg.links)){
   assert.equal(value,links.reference(key,row.slug),row.slug+' exact existing fieldKey for '+key);
   const oldFragment=typeof a.cfg.links[key]==='string'&&a.cfg.links[key].includes('#')?a.cfg.links[key].slice(a.cfg.links[key].indexOf('#')):'';
   if(links.sections[key]&&oldFragment&&oldFragment!=='#')assert.equal(links.sections[key][1],oldFragment,row.slug+' original section destination');
   if(kind==='inline')rows.push({page:row.slug,configId:b.config,property:'links.'+key,customValue:links.local(key,row.slug)?null:links.fieldFor(key).name,fieldKey:links.local(key,row.slug)?null:links.fieldFor(key).fieldKey,fragment:links.sections[key]?.[1]||'',previousValue:a.cfg.links[key],configuredValue:value,currentGHLValue:links.local(key,row.slug)?value:links.fieldFor(key).value,status:links.local(key,row.slug)?'PRESERVED_LOCAL_ANCHOR':'VALID_KEY_PENDING_URL'});
  }
  const body=current.slice(current.indexOf('</style>')+8,current.lastIndexOf('<script>'));
  for(const m of body.matchAll(/<(?:a|option)\b[^>]*data-[\w-]+-link="([^"]+)"[^>]*>/g)){
   const v=m[0].match(/\b(?:href|value)="([^"]*)"/)?.[1];
   assert(!v||!/^\//.test(v),row.slug+' unintended hardcoded cross-page fallback '+v);
  }
  if(kind==='inline')pages.push({slug:row.slug,status:'PASS',variants:2,linkProperties:Object.keys(b.cfg.links).length});
 }
 if(row.slug!=='main'){
  const script=path.join(common.pages,row.slug,'_build/src',row.slug+'.js'),old=path.join(baseline,row.slug,'_build/src',row.slug+'.js');
  assert.equal(fs.readFileSync(path.join(common.pages,row.slug,'_build/build.js'),'utf8'),fs.readFileSync(path.join(baseline,row.slug,'_build/build.js'),'utf8'),row.slug+' builder and guards preserved');
  let expected=fs.readFileSync(old,'utf8');
  if(row.slug==='investors-partners')expected=expected.replace(/'\/smes-projects#sme-situation'/g,"'#'");
  assert.equal(fs.readFileSync(script,'utf8').replace('    siteResolveLinks(cfg);\n',''),expected,row.slug+' unrelated runtime unchanged');
 }
}
assert.equal(pages.length,23);assert.equal(rows.length,704);assert.equal(new Set(rows.map(r=>r.customValue).filter(Boolean)).size,43);
const targets={home:'main',financialEngine:'financial-engine',ecosystem:'ecosystem',platforms:'platforms',smes:'smes-projects',investors:'investors-partners',governance:'governance'};
for(const [key,[base,fragment]]of Object.entries(links.sections))if(targets[base])assert(common.block(targets[base]).includes('id="'+fragment.slice(1)+'"'),key+' target section actually exists');
for(const f of links.snapshot.customValues){
 const used=rows.filter(r=>r.customValue===f.name);
 notes.push({...f,usedBy:[...new Set(used.map(r=>r.page))],references:used.length,status:used.length?'VALID_KEY_PENDING_URL':f.name==='contact'?'LEGACY_CONTACT_DIFFERENT_DESTINATION':f.name==='Home  Hero Image'?'IMAGE_OUTSIDE_SCOPE':'UNUSED_SAMPLE'});
}
assert.equal(notes.filter(n=>n.status==='VALID_KEY_PENDING_URL').length,43);assert(notes.filter(n=>n.references).every(n=>n.value==='#'));
fs.writeFileSync(path.join(out,'static.json'),JSON.stringify({date:new Date().toISOString(),status:'PASS',pages,linkEntries:rows.length,convertedEntries:rows.filter(r=>r.customValue).length,uniqueCustomValues:43,validation:notes,mapping:rows,liveGHL:'NOT VERIFIED'},null,2)+'\n');
const csv=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
for(const [file,data]of [['link-mapping.csv',rows],['custom-values-validation.csv',notes.map(n=>({...n,usedBy:n.usedBy.join('; ')}))]]){
 const keys=Object.keys(data[0]);fs.writeFileSync(path.join(__dirname,file),keys.map(csv).join(',')+'\n'+data.map(r=>keys.map(k=>csv(r[k])).join(',')).join('\n')+'\n');
}
console.log('PASS: 23 pages / 46 outputs, 704 mappings, 702 exact GHL references, 2 preserved local anchors, 43 reused values; exact CSS/content/non-navigation settings');
