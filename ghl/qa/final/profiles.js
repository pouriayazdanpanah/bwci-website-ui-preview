#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),{chromium}=require('playwright');
const {fs,path,out,manifest,prepare,port,ready}=require('./common');
const requested=process.argv.find(a=>a.startsWith('--slugs='))?.slice(8).split(','),kinds=process.argv.find(a=>a.startsWith('--kinds='))?.slice(8).split(',')||['source','inline','hosted'];
const base=(process.argv[2]||'http://127.0.0.1:8125').replace(/\/$/,''),dir=path.join(out,'profiles');fs.mkdirSync(dir,{recursive:true});
async function snapshot(p,P){return p.evaluate(P=>{
 const text=e=>e.textContent.replace(/\s+/g,' ').trim(),hero=document.querySelector('#top, #'+P+'-top'),bio=document.querySelector('#biography, #'+P+'-biography'),rel=document.querySelector('#related, #'+P+'-related'),nav=document.querySelector('nav[aria-label="Governance sections"]');
 return {name:text(hero.querySelector('h1')),crumb:[...hero.querySelectorAll('nav li')].map(text),current:text(nav.querySelector('a[aria-current]')||nav.querySelector('select').selectedOptions[0]),
  paragraphs:[...bio.querySelectorAll('.pg-body p, .'+P+'-pg-body p')].map(text),roles:[...hero.querySelectorAll('.lead, .'+P+'-lead')].map(text),labels:[...hero.querySelectorAll('ul li')].map(text),fields:[...bio.querySelectorAll('dl>div')].map(e=>[text(e.querySelector('dt')),text(e.querySelector('dd'))]),related:[...rel.querySelectorAll('a.gv-card')].map(e=>e.getAttribute('aria-label')),
  images:[...document.querySelectorAll('image-slot, .'+P+'-slot')].map(e=>{const i=e.shadowRoot?e.shadowRoot.querySelector('img'):e.querySelector('img'),r=i.getBoundingClientRect(),f=e.getBoundingClientRect();return [i.complete,i.naturalWidth,i.naturalHeight,Math.round(r.width),Math.round(r.height),Math.round(f.width),Math.round(f.height)];})};
 },P);}
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{for(const row of manifest().filter(r=>r.slug.startsWith('profile-')&&(!requested||requested.includes(r.slug)))){
 const report={slug:row.slug,date:new Date().toISOString(),cases:[],states:[],errors:[],console:[],network:[]},refs=new Map();
 async function open(kind,query='',mobile=false){const p=await b.newPage({viewport:{width:mobile?390:1440,height:mobile?844:900},hasTouch:mobile,isMobile:mobile,reducedMotion:mobile?'reduce':'no-preference'});await prepare(p,report);const url=kind==='source'?base+'/design/'+encodeURIComponent(row.source):await port(p,row,kind,base);await ready(p,url+query,row);return p;}
 for(const kind of kinds){let p;try{
  for(const query of ['', '?from=board','?from=leadership','?from=invalid']){
   if(p)await p.close();p=await open(kind,query);const state=await snapshot(p,row.prefix);assert(state.images.length===row.relatedCount+1&&state.images.every(i=>i[0]&&i[1]>0));assert.equal(state.related.length,row.relatedCount);
   if(kind==='source')refs.set(query,state);else assert.deepEqual(state,refs.get(query),kind+' '+query+' source profile data/entry context/portrait fit');
   report.states.push({kind,query,state});report.cases.push({name:kind+' context '+(query||'direct'),status:'PASS'});
  }
  const card=p.locator('a.gv-card').first();await card.hover();await p.waitForFunction(()=>getComputedStyle(document.querySelector('a.gv-card .gv-card-ov')).opacity==='1',{},{timeout:3000});assert.equal(await card.locator('.gv-card-ov').evaluate(e=>getComputedStyle(e).opacity),'1');
  await p.mouse.move(1,1);await p.waitForTimeout(650);await card.focus();await p.keyboard.press('Shift+Tab');await p.keyboard.press('Tab');assert.equal(await card.evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
  const nav=p.locator('nav[aria-label="Governance sections"]');await nav.scrollIntoViewIfNeeded();await p.evaluate(()=>scrollBy(0,250));await p.waitForTimeout(250);const top=await nav.evaluate(e=>e.getBoundingClientRect().top);assert(top>=0&&top<130,'sticky GovNav');
  await p.setViewportSize({width:390,height:844});const rail=p.locator('.gv-also, .'+row.prefix+'-gv-also');await rail.evaluate(e=>{e.scrollLeft=0;e.scrollIntoView({block:'center',behavior:'instant'});});await p.waitForTimeout(800);const rect=await rail.boundingBox(),y=rect.y+Math.min(80,rect.height/2);
  await p.mouse.move(rect.x+280,y);await p.mouse.down();await p.mouse.move(rect.x+277,y);assert.equal(await rail.evaluate(e=>/is-drag/.test(e.className)),false);await p.mouse.move(rect.x+100,y,{steps:12});const moved=await rail.evaluate(e=>e.scrollLeft);await p.mouse.up();assert(moved>30);assert.equal(await rail.evaluate(e=>/is-drag/.test(e.className)),false);
  report.cases.push({name:kind+' hover/focus/sticky/threshold/mouse-drag',status:'PASS'});await p.close();p=await open(kind,'',true);
  const touchRail=p.locator('.gv-also, .'+row.prefix+'-gv-also');await touchRail.evaluate(e=>{e.scrollLeft=0;e.scrollIntoView({block:'center',behavior:'instant'});});await p.waitForTimeout(800);const cap=p.locator('a.gv-card .gv-card-t').first();await cap.scrollIntoViewIfNeeded();const box=await cap.boundingBox(),ty=Math.max(20,Math.min(800,box.y+15)),cdp=await p.context().newCDPSession(p);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:270,y:ty}]});for(let x=250;x>=80;x-=20){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:ty}]});await p.waitForTimeout(20);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(500);assert((await touchRail.evaluate(e=>e.scrollLeft))>30);
  assert.equal(await p.locator('.gv-card-ov').first().evaluate(e=>getComputedStyle(e).opacity),'1');assert.equal(await p.locator('.gv-portrait, .'+row.prefix+'-gv-portrait').evaluate(e=>getComputedStyle(e).animationName),'none');report.cases.push({name:kind+' touch-swipe/mobile-overlay/reduced-motion',status:'PASS'});
 }catch(e){report.cases.push({name:kind,status:'FAIL',error:e.message});console.log('FAIL profile '+row.slug+' '+kind+': '+e.message.split('\n')[0]);}finally{if(p)await p.close();}}
 fs.writeFileSync(path.join(dir,row.slug+'.json'),JSON.stringify(report,null,2)+'\n');if(report.cases.some(c=>c.status==='FAIL')||report.errors.length||report.console.length||report.network.length)process.exitCode=1;
 console.log((report.cases.some(c=>c.status==='FAIL')?'FAIL':'PASS')+' profile '+row.slug+' '+report.cases.length+' scenarios');
}}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
