#!/usr/bin/env node
// Resolve trace differences caused by transitional hover frames, pointer transit and image-slot's
// hidden editor controls. These checks isolate the actual product control contract on all variants.
'use strict';
const assert=require('node:assert/strict'),{chromium}=require('playwright');
const {fs,path,out,manifest,prepare,port,ready,reveal}=require('./common');
const requested=process.argv.find(a=>a.startsWith('--slugs='))?.slice(8).split(',');
const base=(process.argv[2]||'http://127.0.0.1:8125').replace(/\/$/,''),report={date:new Date().toISOString(),cases:[],errors:[],console:[],network:[]};
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{for(const row of manifest().filter(r=>['main','governance-board','investors-partners'].includes(r.slug)&&(!requested||requested.includes(r.slug))))for(const kind of ['source','inline','hosted']){
 const p=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'no-preference'});await prepare(p,report);const record={slug:row.slug,kind,status:'PASS'};
 try{
  const url=kind==='source'?base+'/design/'+encodeURIComponent(row.source):await port(p,row,kind,base);await ready(p,url,row);await reveal(p,true);
  if(row.slug==='main'){
   const cards=p.locator('.ix-c'),active=()=>cards.evaluateAll(es=>es.findIndex(e=>e.getAttribute('aria-expanded')==='true'));
   await cards.nth(2).hover();await p.waitForTimeout(180);assert.equal(await active(),2);
   await cards.nth(3).evaluate(card=>{const parent=card.closest('.ix');card.dispatchEvent(new PointerEvent('pointerover',{bubbles:true,pointerType:'mouse',relatedTarget:document.body}));card.dispatchEvent(new PointerEvent('pointerenter',{pointerType:'mouse'}));card.dispatchEvent(new PointerEvent('pointerout',{bubbles:true,pointerType:'mouse',relatedTarget:document.body}));parent.dispatchEvent(new MouseEvent('mouseout',{bubbles:true,relatedTarget:document.body}));parent.dispatchEvent(new MouseEvent('mouseleave'));});
   await p.waitForTimeout(150);assert.equal(await active(),2,'70ms hover cancels on leaving group in same browser task');
   await cards.nth(3).hover();await p.waitForTimeout(180);assert.equal(await active(),3);
   await cards.nth(1).click();assert.equal(await active(),1);await cards.nth(0).focus();assert.equal(await active(),0);
   let tabs=0;for(;tabs<8;tabs++){await p.keyboard.press('Tab');if(await cards.nth(1).evaluate(e=>e===document.activeElement||e.contains(document.activeElement)))break;}
   assert(tabs<8,'keyboard reaches next card');assert.equal(await active(),1);record.tabPressesToNextCard=tabs+1;if(kind!=='source')assert.equal(tabs+1,1,'native GHL cards have no editor-only image-slot stops');
  }else if(row.slug==='governance-board'){
   const band=p.locator('#framework-link a, #gvb-framework-link a');await band.scrollIntoViewIfNeeded();await p.waitForTimeout(500);await band.hover();await p.waitForTimeout(800);
   assert(await band.evaluate(e=>e.matches(':hover')));record.style=await band.evaluate(e=>({color:getComputedStyle(e).color,border:getComputedStyle(e).borderBottomColor,arrow:getComputedStyle(e.querySelector('[aria-hidden]')).transform}));
   assert.equal(record.style.color,'rgb(13, 110, 89)');assert.equal(record.style.border,'rgb(13, 110, 89)');assert.equal(record.style.arrow,'matrix(1, 0, 0, 1, 3, 0)');
  }else{
   const items=p.locator('.pp-item'),active=()=>items.evaluateAll(es=>es.findIndex(e=>/pp-item--on/.test(e.className)));
   assert.equal(await items.count(),3);for(let i=0;i<3;i++){await items.nth(i).hover();await p.waitForTimeout(200);assert.equal(await active(),i);}
   await p.mouse.move(1,1);for(let i=0;i<3;i++){await items.nth(i).focus();await p.waitForTimeout(100);assert.equal(await active(),i);}
   record.principleHoverFocus='all three stages match explicit input';
  }
 }catch(e){record.status='FAIL';record.error=e.message;}finally{await p.close();report.cases.push(record);console.log(record.status+' focused '+row.slug+' '+kind+(record.error?' '+record.error.split('\n')[0]:''));fs.writeFileSync(path.join(out,requested?'focused-targeted.json':'focused.json'),JSON.stringify(report,null,2)+'\n');}
}}finally{await browser.close();}if(report.cases.some(r=>r.status==='FAIL')||report.errors.length||report.console.length||report.network.length)process.exitCode=1;})().catch(e=>{console.error(e);process.exitCode=1;});
