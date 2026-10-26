#!/usr/bin/env node
// Local acceptance checks for the required interactive engine; source is static, so interaction
// is assessed against its retained data/logic and the explicit brief, not static pixel equivalence.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {chromium}=require('playwright');
const {host,withConfig,parse}=require('../../../shared/site-chrome/qa/sync/common');
const routeReact=require('../../governance/_build/qa-routes');
const base=(process.argv[2]||'http://127.0.0.1:8124').replace(/\/$/,''),out=path.join(__dirname,'qa-output/interaction');fs.mkdirSync(out,{recursive:true});
const page=path.resolve(__dirname,'..'),root='#bwci-better-world-impact',owner='__bwciBetterWorldImpact';
const inline=fs.readFileSync(path.join(page,'better-world-impact.inline.ghl.html'),'utf8'),runtime=parse(inline).runtime;
const source=fs.readFileSync(path.resolve(__dirname,'../../../../design/Better World Impact.dc.html'),'utf8');
const steps=vm.runInNewContext(source.match(/const STEPS = (\[[\s\S]*?\n    \]);/)[1]);
const widths=[320,360,375,390,430,767,768,1023,1024,1280,1366,1440,1600,1920,2560];
const result={date:new Date().toISOString(),scope:'Required Impact interaction, both variants, source data, unchanged-section source comparison',cases:[],visual:[],errors:[],console:[],network:[]};
let browser;
async function fresh(width,height=900,{touch=false,motion=false}={}){
 const p=await browser.newPage({viewport:{width,height},hasTouch:touch,reducedMotion:motion?'no-preference':'reduce'});
 await routeReact(p);await p.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,r=>r.abort());
 p.on('pageerror',e=>result.errors.push(String(e)));p.on('console',m=>{if(m.type()==='error'&&!/fonts\.(googleapis|gstatic)/.test(m.location().url))result.console.push(m.text());});
 p.on('requestfailed',r=>{if(!/fonts\.(googleapis|gstatic)/.test(r.url())&&r.failure().errorText!=='net::ERR_ABORTED')result.network.push(r.url()+': '+r.failure().errorText);});
 p.on('response',r=>{if(r.status()>=400)result.network.push(r.url()+': '+r.status());});return p;
}
async function load(p,variant='inline',aggressive=false,extra={}){
 let block=variant==='inline'?inline:fs.readFileSync(path.join(page,'better-world-impact.ghl.html'),'utf8');
 if(variant==='hosted'){
  const cfg=parse(inline).cfg,assets=new Map();
  for(const key of ['impactHeroImage','logoImage']){const url=base+'/__interaction__/asset/'+key;assets.set(url,cfg[key]);extra={...extra,[key]:url};}
  await p.route('**/__interaction__/asset/**',r=>{const data=assets.get(r.request().url()).match(/^data:([^;]+);base64,(.*)$/s);return r.fulfill({contentType:data[1],body:Buffer.from(data[2],'base64')});});
 }
 block=withConfig(block,extra);
 await p.route(base+'/__interaction__/page.html',r=>r.fulfill({contentType:'text/html',body:host(block,aggressive,true)}));
 await p.goto(base+'/__interaction__/page.html',{waitUntil:'domcontentloaded'});await p.waitForFunction(k=>!!window[k]?.instance,owner);
}
async function state(p,index){
 const narrow=p.viewportSize().width<1024,n=index+1;
 assert.equal(await p.locator('[data-bwi-engine-step].bwi-is-on').count(),1);
 assert.equal(await p.locator('[data-bwi-engine-step="'+index+'"]').getAttribute('aria-expanded'),'true');
 assert.equal(await p.locator('[data-bwi-engine-progress]').getAttribute('aria-valuenow'),String(n));
 assert.equal(Number(await p.locator('[data-bwi-engine-loop]').evaluate(e=>e.style.getPropertyValue('--p'))),index/5);
 assert.equal(await p.locator('.bwi-lpd-pane[aria-hidden="false"],.bwi-lp-acc[aria-hidden="false"]').count(),1);
 const id='bwi-engine-'+(narrow?'mobile-':'panel-')+n,region=p.locator('#'+id);
 assert.equal(await p.locator('[data-bwi-engine-step="'+index+'"]').getAttribute('aria-controls'),id);
 assert.equal(await region.getAttribute('aria-hidden'),'false');assert.equal(await region.evaluate(e=>e.inert),false);
 assert.equal(await region.locator('.bwi-lpd-d').textContent(),steps[index][1]);assert.equal(await region.locator('.bwi-lpd-ex span').last().textContent(),steps[index][2]);
 assert.equal(await p.locator('.bwi-lp-tag').count(),3);
 assert.equal(await p.locator('[data-bwi-evidence]').isVisible(),false);assert.equal(await p.locator('[data-bwi-cases]').isVisible(),false);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'document overflow');
}
const only=process.argv.find(a=>a.startsWith('--only='))?.slice(7);
async function check(name,fn){if(only&&name!==only)return;try{await fn();result.cases.push({name,status:'PASS'});console.log('PASS '+name);}catch(e){result.cases.push({name,status:'FAIL',error:e.message});console.log('FAIL '+name+': '+e.message);}}
async function behavior(width,height,variant,aggressive=false,touch=false,motion=false){
 const p=await fresh(width,height,{touch,motion});try{
  await load(p,variant,aggressive);await state(p,0);
  for(let i=0;i<6;i++){
   const node=p.locator('[data-bwi-engine-step="'+i+'"]');if(touch)await node.tap();else await node.click();await state(p,i);
   const region=p.locator('#bwi-engine-'+(width<1024?'mobile-':'panel-')+(i+1));await region.scrollIntoViewIfNeeded();assert.equal(await region.isVisible(),true);
   const bounds=await node.boundingBox();assert(bounds.width>0&&bounds.height>=22,'real stage button hit box');
  }
  await p.locator('[data-bwi-engine-next]').click();await state(p,0);await p.locator('[data-bwi-engine-prev]').click();await state(p,5);
  const first=p.locator('[data-bwi-engine-step="0"]');await first.focus();await p.keyboard.press('Home');await state(p,0);await p.keyboard.press('ArrowLeft');await state(p,5);await p.keyboard.press('ArrowRight');await state(p,0);await p.keyboard.press('End');await state(p,5);await p.keyboard.press('ArrowUp');await state(p,4);
  const focused=p.locator('[data-bwi-engine-step="4"]');assert.equal(await focused.evaluate(e=>document.activeElement===e),true);
  assert.equal(await focused.evaluate(e=>getComputedStyle(e.querySelector('.bwi-lp-dot')).outlineStyle),'solid','visible keyboard focus');
  await p.keyboard.press('Enter');await state(p,4);await p.keyboard.press('Space');await state(p,4);
  assert.equal(await p.locator('[data-bwi-engine-count]').textContent(),'Step 5 of 6: Activity');
  if(!motion)assert.equal(await p.locator('.bwi-lp-prog').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
  // Wheel remains ordinary page scrolling even over the engine. No document input trap is added.
  await p.locator('#bwi-engine').evaluate(e=>window.scrollTo({top:e.offsetTop+100,behavior:'instant'}));const y=await p.evaluate(()=>scrollY);await p.mouse.move(width/2,Math.min(height/2,400));await p.mouse.wheel(0,160);await p.waitForTimeout(100);assert((await p.evaluate(()=>scrollY))>y);
 }finally{await p.close();}
}
async function lifecycle(variant,width){const p=await fresh(width);try{
 await load(p,variant,true,{footer:{regulatoryLine:'Local lifecycle QA'}});await p.locator('[data-bwi-engine-step="3"]').click();await state(p,3);
 await p.evaluate(k=>window.__savedOwner=window[k],owner);await p.addScriptTag({content:runtime});assert(await p.evaluate(k=>window[k]===window.__savedOwner,owner));
 if(width<1280){await p.locator('[data-bwi-menu-open]').click();assert.equal(await p.evaluate(()=>document.body.style.overflow),'hidden');}
 await p.evaluate(()=>{window.__oldHost=document.getElementById('sync-host');window.__oldNext=window.__oldHost.querySelector('[data-bwi-engine-next]');window.__oldHost.replaceWith(window.__oldHost.cloneNode(true));});
 await p.waitForFunction(k=>window[k].root===document.getElementById('bwci-better-world-impact'),owner);await state(p,0);assert.equal(await p.evaluate(()=>document.body.style.overflow),'scroll');
 const old=await p.evaluate(()=>window.__oldHost.querySelector('[data-bwi-engine-count]').textContent);await p.evaluate(()=>window.__oldNext.click());assert.equal(await p.evaluate(()=>window.__oldHost.querySelector('[data-bwi-engine-count]').textContent),old);
 await p.locator('[data-bwi-engine-next]').click();await state(p,1);assert.equal(await p.locator('.bwi-sft__reg').count(),1);
 await p.evaluate(()=>{window.__laterHost=document.getElementById('sync-host').cloneNode(true);document.getElementById('sync-host').remove();});await p.waitForFunction(k=>window[k].root===null,owner);await p.evaluate(()=>document.body.appendChild(window.__laterHost));await p.waitForFunction(k=>!!window[k].instance,owner);await state(p,0);
 await p.setViewportSize({width:width<1024?1440:390,height:700});await state(p,0);await p.locator('[data-bwi-engine-step="2"]').click();await state(p,2);await p.setViewportSize({width,height:900});await state(p,2);
 await p.evaluate(k=>window[k].destroy(),owner);assert.equal(await p.evaluate(k=>window[k],owner),undefined);assert.equal(await p.evaluate(()=>document.body.style.overflow),'scroll');
 const count=await p.locator('[data-bwi-engine-count]').textContent();await p.locator('[data-bwi-engine-next]').click();assert.equal(await p.locator('[data-bwi-engine-count]').textContent(),count);
 await p.addScriptTag({content:runtime});await p.waitForFunction(k=>!!window[k].instance,owner);await state(p,0);await p.locator('[data-bwi-engine-next]').click();await state(p,1);
}finally{await p.close();}}
async function deferredHover(){
 const p=await fresh(1440,600,{motion:true});try{
  await p.route(base+'/__interaction__/late.html',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;overflow:auto"><div id="sync-host"></div></body></html>'}));
  await p.goto(base+'/__interaction__/late.html',{waitUntil:'domcontentloaded'});await p.addScriptTag({content:runtime});await p.evaluate(k=>window.__pending=window[k],owner);await p.addScriptTag({content:runtime});assert(await p.evaluate(k=>window.__pending===window[k],owner));
  await p.locator('#sync-host').evaluate((e,html)=>e.innerHTML=html,inline);await p.waitForFunction(k=>!!window[k].instance,owner);await state(p,0);
  const second=p.locator('[data-bwi-engine-step="1"]');await second.hover();await p.waitForTimeout(450);await state(p,0);
  const scale=await second.locator('.bwi-lp-dot').evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e).transform).a);assert(scale>1,'source hover scale without changing selection');
  await second.click();await state(p,1);await p.waitForTimeout(700);
  const card=await p.locator('[data-bwi-engine-details]').boundingBox();assert(card.y+card.height<=p.viewportSize().height-15||card.y<=81,'desktop detail reveal within source limits');
  await p.evaluate(k=>window[k].destroy(),owner);assert.equal(await p.evaluate(()=>document.body.style.overflow),'auto');
 }finally{await p.close();}
}
async function mobileLinkContrast(){
 for(const width of widths.filter(w=>w<1024))for(const variant of ['inline','hosted']){
  const p=await fresh(width);try{
   await load(p,variant,width===390);const link=p.locator('[data-bwi-link="financialEngineHero"]');await link.scrollIntoViewIfNeeded();
   const style=await link.evaluate(e=>({color:getComputedStyle(e).color,background:getComputedStyle(e).backgroundColor,arrow:getComputedStyle(e.querySelector('span')).color}));
   assert.equal(style.color,'rgb(255, 255, 255)',width+' '+variant+' legible mobile label');assert.equal(style.arrow,style.color);assert.equal(style.background,'rgb(18, 48, 57)');
   await p.locator('[data-bwi-engine-next]').click();await state(p,1);
   if(width===390&&variant==='inline'){
    await settle(p);await p.screenshot({path:path.join(out,'mobile-contrast-fixed.png'),fullPage:true,animations:'disabled'});
    const box=await p.locator('#bwi-engine').boundingBox();fs.writeFileSync(path.join(out,'mobile-contrast-fixed-box.json'),JSON.stringify(box));
   }
   console.log('PASS contrast '+width+' '+variant);
  }finally{await p.close();}
 }
}
async function settle(p){await p.waitForTimeout(2900);await p.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=Math.round(innerHeight*.65)){window.scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,65));}await new Promise(r=>setTimeout(r,1300));window.scrollTo({top:0,behavior:'instant'});});await p.waitForTimeout(300);}
async function visual(width,height=900){
 for(const kind of ['source','inline','hosted']){
  const p=await fresh(width,height);try{
   if(kind==='source')await p.goto(base+'/design/Better%20World%20Impact.dc.html');else await load(p,kind);
   await settle(p);
   const selectors=kind==='source'?['.hero','#approach','#methodology','#next']:['.bwi-hero','#bwi-approach','#bwi-methodology','#bwi-next'];
   const sections=[];for(const selector of selectors){const el=p.locator(selector);const box=await el.boundingBox();assert(box&&box.height>0,selector);sections.push({selector,...box,text:(await el.innerText()).replace(/\s+/g,' ').trim()});}
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   const screenshot=kind+'-'+width+'-'+height+'.png';await p.screenshot({path:path.join(out,screenshot),fullPage:true,animations:'disabled'});
   const engine=kind==='source'?'.lp':'.bwi-lp',geometry=await p.locator(engine).evaluate(e=>{const ring=e.querySelector('[class$="lp-ring"]');const r=ring.getBoundingClientRect();return {width:e.getBoundingClientRect().width,radius:getComputedStyle(e).getPropertyValue('--R'),ringWidth:r.width};});
   result.visual.push({width,height,kind,status:'PASS',sections,screenshot,geometry});console.log('CAPTURE '+kind+' '+width+'x'+height);
  }finally{await p.close();}
 }
}
(async()=>{browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{
 if(!process.argv.includes('--visual-only')){
  for(const width of widths)for(const variant of ['inline','hosted'])await check('stages/controls/keyboard '+width+'x900 '+variant,()=>behavior(width,900,variant));
  for(const [width,height] of [[390,600],[1024,600],[1440,600],[1440,1200]])for(const variant of ['inline','hosted'])await check('varied height '+width+'x'+height+' '+variant,()=>behavior(width,height,variant));
  for(const width of [320,390,1024,1440])for(const variant of ['inline','hosted'])await check('hostile host '+width+' '+variant,()=>behavior(width,900,variant,true));
  for(const width of [390,1024])for(const variant of ['inline','hosted'])await check('normal motion/touch '+width+' '+variant,()=>behavior(width,900,variant,false,true,true));
  for(const width of [390,1440])for(const variant of ['inline','hosted'])await check('lifecycle/resize '+width+' '+variant,()=>lifecycle(variant,width));
  await check('delayed bootstrap / hover / reveal',deferredHover);
  await check('mobile link contrast across eight widths and both variants',mobileLinkContrast);
 }
 if(!process.argv.includes('--behavior-only'))for(const width of widths)await check('unchanged source sections '+width,()=>visual(width));
}finally{await browser.close();}
const name=only?'targeted-'+only.replace(/[^\w-]+/g,'-'):process.argv.includes('--visual-only')?'visual':process.argv.includes('--behavior-only')?'behavior':'all';fs.writeFileSync(path.join(out,name+'.json'),JSON.stringify(result,null,2)+'\n');
if(result.cases.some(r=>r.status==='FAIL')||result.errors.length||result.console.length||result.network.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
