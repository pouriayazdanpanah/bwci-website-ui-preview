#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),images=require('..');
// the resolver of a page that declares every page-only setting, so every known setting is exercised below
const ctx={};vm.createContext(ctx);vm.runInContext(images.runtimeFor(images.pageRoots).replace(/__P__/g,'test'),ctx);
// adding a page must not change existing blocks: the list every page carries is exactly the frozen shared one
const shared=JSON.parse(/var paths = (\[.*?\]\]);/.exec(images.runtime)[1]);
assert.deepEqual(shared.filter((p)=>p.length===1).map((p)=>p[0]),images.sharedRoots,'shared image settings changed');
assert.deepEqual(images.sharedRoots,['logoImage','heroImage','financialEngineImage','ecosystemHeroImage','platformsHeroImage','smesHeroImage','investorsHeroImage','impactHeroImage'],'the shared image settings are frozen: add a page-only setting instead');
for(const k of images.pageRoots)assert(!shared.some((p)=>p.length===1&&p[0]===k),'page-only setting in the shared list: '+k);
const root={querySelectorAll:()=>[]},data='data:image/png;base64,aW1hZ2U=';let count=0;
function test(label,fn){fn();count++;}
for(const value of ['', ' ', '#','{{ custom_values.bwci_img_logo }}','https://REPLACE-WITH-YOUR-HOSTED-URL/logo.png','javascript:alert(1)','//unapproved.test/a','data:text/html;base64,abc','/img/{{ unresolved }}'])test('skip '+value,()=>assert.equal(ctx.siteImageAvailable(value),false));
for(const value of ['https://images.test/a.webp?x=1&y=2','http://images.test/a.png','/media/image.png',data])test('usable '+value,()=>assert.equal(ctx.siteImageAvailable(value),true));
for(const parts of images.paths){
 for(const invalid of ['', '#','{{ custom_values.unresolved }}',null,9,false]){
  test(parts.join('.')+' inline fallback',()=>{const cfg={imageFallbacks:{},links:{home:'unchanged'}};images.put(cfg,parts,invalid);images.put(cfg.imageFallbacks,parts,data);ctx.siteResolveImages(root,cfg);assert.equal(images.get(cfg,parts),data);assert.equal(cfg.links.home,'unchanged');});
  test(parts.join('.')+' hosted skip',()=>{const cfg={};images.put(cfg,parts,invalid);ctx.siteResolveImages(root,cfg);assert.equal(images.get(cfg,parts),'');});
 }
 test(parts.join('.')+' primary wins',()=>{const cfg={imageFallbacks:{}};images.put(cfg,parts,' https://cdn.test/new.webp ');images.put(cfg.imageFallbacks,parts,data);ctx.siteResolveImages(root,cfg);assert.equal(images.get(cfg,parts),'https://cdn.test/new.webp');});
}
test('null optional containers are safe',()=>{ctx.siteResolveImages(root,{images:null,peopleImages:null,imageFallbacks:null});});
test('cloned stale URLs cleared without assigning an empty src',()=>{
 const cleared=[];const make=(attrs)=>({getAttribute:k=>attrs[k]||null,removeAttribute:k=>cleared.push(k)});
 ctx.siteResolveImages({querySelectorAll:()=>[make({'data-test-asset':'logoImage'}),make({'data-test-person':'farhad-reyazat'})]},{logoImage:'#',peopleImages:{'farhad-reyazat':'{{ x }}'}});assert.deepEqual(cleared,['src','src']);
});
test('builder keeps original bytes as fallback without mutating input',()=>{const cfg={logoImage:data,links:{home:'original'}};const out=images.forOutput(cfg);assert.equal(out.logoImage,images.definitions.logo.fieldKey);assert.equal(out.imageFallbacks.logoImage,data);assert.equal(cfg.logoImage,data);assert.deepEqual(out.links,cfg.links);});
test('hosted output contains only references',()=>{const out=images.forOutput({logoImage:'https://old.test/logo.png'});assert.equal(out.logoImage,images.definitions.logo.fieldKey);assert.equal(out.imageFallbacks,undefined);});
test('output conversion is idempotent',()=>{const out=images.forOutput({logoImage:data});assert.deepEqual(images.forOutput(out),out);});
const out=path.join(__dirname,'output');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'unit.json'),JSON.stringify({status:'PASS',checks:count},null,2)+'\n');console.log('PASS '+count+' image resolution/producer boundary checks');
