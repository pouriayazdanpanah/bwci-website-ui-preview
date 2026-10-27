#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm'),crypto=require('node:crypto');
const images=require('..'),common=require('../../site-chrome/qa/sync/common');
const baseline=process.argv[2]||'/tmp/bwci-images-baseline/ghl/pages',out=path.join(__dirname,'output');fs.mkdirSync(out,{recursive:true});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');const rows=[],pages=[],used=new Map();
for(const row of common.manifest()){
 for(const kind of ['hosted','inline']){
  const before=common.block(row.slug,kind,baseline),current=common.block(row.slug,kind),a=common.parse(before),b=common.parse(current);
  assert.equal(a.config,b.config);assert.equal(a.root,b.root);assert.equal(a.owner,b.owner);assert.equal(a.prefix,b.prefix);
  assert.equal(before.match(/<style>([\s\S]*?)<\/style>/)[1],current.match(/<style>([\s\S]*?)<\/style>/)[1],row.slug+' exact CSS');
  assert.equal(before.slice(before.indexOf('</style>')+8,before.lastIndexOf('<script>')),current.slice(current.indexOf('</style>')+8,current.lastIndexOf('<script>')),row.slug+' exact HTML/content');
  const original=JSON.parse(JSON.stringify(a.cfg)),changed=JSON.parse(JSON.stringify(b.cfg));delete changed.imageFallbacks;
  const fallbackExpected={};
  for(const e of images.entries(a.cfg)){
   assert.equal(images.get(b.cfg,e.parts),e.definition.fieldKey,row.slug+' exact image reference '+e.path);
   images.put(original,e.parts,'IMAGE');images.put(changed,e.parts,'IMAGE');
   if(kind==='inline'){
    assert.equal(images.get(b.cfg.imageFallbacks,e.parts),e.value,'Exact embedded fallback '+row.slug+' '+e.path);
    images.put(fallbackExpected,e.parts,e.value);
    const bytes=Buffer.from(e.value.split(',')[1],'base64'),hash=sha(bytes);assert.equal(hash,sha(fs.readFileSync(path.join(common.repo,e.definition.asset))));
    if(!used.has(e.id))used.set(e.id,new Set());used.get(e.id).add(hash);
    rows.push({page:row.slug,configId:b.config,property:e.path,image:e.id,customValue:e.definition.name,fieldKey:e.definition.fieldKey,status:e.definition.existing?'EXISTING_REUSED':'CREATE_IN_GHL',referenceAsset:e.definition.asset,sourceSHA256:hash});
   }
  }
  assert.deepEqual(original,changed,row.slug+' all unrelated configuration and navigation unchanged');
  if(kind==='inline')assert.deepEqual(b.cfg.imageFallbacks,fallbackExpected);else assert.equal(b.cfg.imageFallbacks,undefined);
  new vm.Script(b.runtime);assert.equal((b.runtime.match(/siteResolveImages\(root,cfg\);/g)||[]).length,1);
  const previousRuntime=b.runtime.replace(images.runtime.replace(/__P__/g,row.prefix)+'\n','').replace('    siteResolveImages(root,cfg);\n','');
  assert.equal(previousRuntime,a.runtime,row.slug+' unrelated runtime preserved');
 }
 if(row.slug!=='main'){
  const folder=path.join(common.pages,row.slug,'_build'),old=path.join(baseline,row.slug,'_build');
  assert.equal(fs.readFileSync(path.join(folder,'src',row.slug+'.js'),'utf8').replace('    siteResolveImages(root,cfg);\n',''),fs.readFileSync(path.join(old,'src',row.slug+'.js'),'utf8'));
  assert.equal(fs.readFileSync(path.join(folder,'build.js'),'utf8').replace('JSON.stringify(chrome.imageConfig(cfg), null, 2)','JSON.stringify(cfg, null, 2)'),fs.readFileSync(path.join(old,'build.js'),'utf8'));
 }
 pages.push({page:row.slug,status:'PASS',imageSettings:images.entries(row.cfg).length,variants:2});
}
assert.equal(pages.length,23);assert.equal(rows.length,73);assert.equal(used.size,20);assert([...used.values()].every(s=>s.size===1));
assert.equal(Object.values(images.definitions).filter(d=>d.existing).length,14);assert.equal(Object.values(images.definitions).filter(d=>!d.existing).length,6);
const oldHero=require('../../site-links').snapshot.customValues.find(v=>v.name==='Home  Hero Image');assert.equal(images.definitions.mainHero.fieldKey,oldHero.fieldKey);
const csv=v=>'"'+String(v).replace(/"/g,'""')+'"',cols=Object.keys(rows[0]);fs.writeFileSync(path.join(__dirname,'image-mapping.csv'),[cols.map(csv).join(','),...rows.map(r=>cols.map(c=>csv(r[c])).join(','))].join('\n')+'\n');
const inventory=Object.entries(images.definitions).map(([id,d])=>({...d,id,usedBy:rows.filter(r=>r.image===id).map(r=>r.page),references:rows.filter(r=>r.image===id).length}));
fs.writeFileSync(path.join(__dirname,'inventory.json'),JSON.stringify(inventory,null,2)+'\n');
const payloads=inventory.filter(d=>!d.existing).map(d=>({name:d.name,value:'#'}));fs.writeFileSync(path.join(__dirname,'../bwci-image-custom-values-to-create.json'),JSON.stringify(payloads,null,2)+'\n');
fs.writeFileSync(path.join(out,'static.json'),JSON.stringify({date:new Date().toISOString(),status:'PASS',pages,settings:73,images:20,existingKeys:14,newKeys:6,rows,inventory},null,2)+'\n');
console.log('PASS 23 pages / 46 outputs; 73 image settings, 20 unchanged original assets, 14 existing and 6 proposed keys; exact CSS/HTML/navigation/unrelated JS');
