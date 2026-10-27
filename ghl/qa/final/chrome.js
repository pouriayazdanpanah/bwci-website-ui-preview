#!/usr/bin/env node
// Full current shared-menu contract on every native block, including its different page wrappers.
'use strict';
const assert=require('node:assert/strict'),{chromium}=require('playwright');
const {fs,path,out,manifest,prepare,port}=require('./common');
const requested=process.argv.find(a=>a.startsWith('--slugs='))?.slice(8).split(',');
const base=(process.argv[2]||'http://127.0.0.1:8125').replace(/\/$/,''),report={date:new Date().toISOString(),cases:[],errors:[],console:[],network:[]};
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{for(const row of manifest().filter(r=>!requested||requested.includes(r.slug)))for(const job of [
 ...[390,1440].flatMap(width=>['inline','hosted'].map(kind=>({width,kind,scenario:'normal'}))),
 {width:390,kind:'inline',scenario:'toggles'},{width:1440,kind:'inline',scenario:'malformed'}]){
 const p=await browser.newPage({viewport:{width:job.width,height:900},hasTouch:job.width===390,reducedMotion:job.scenario==='normal'?'no-preference':'reduce'});const c={slug:row.slug,...job,status:'PASS'};await prepare(p,report);
 try{
  const url=await port(p,row,job.kind,base,true,job.scenario==='toggles'?{showHeader:false,showFooter:false}:{},job.scenario==='malformed');await p.goto(url,{waitUntil:'domcontentloaded'});await p.waitForFunction(k=>!!window[k]?.instance,row.owner);const P=row.prefix;
  const hdr=p.locator('[data-'+P+'-hdr]'),burger=p.locator('[data-'+P+'-menu-open]'),drawer=p.locator('[data-'+P+'-drawer]');
  if(job.scenario==='toggles'){
   assert.equal(await p.locator('[data-'+P+'-hdr-host], [data-'+P+'-footer]').count(),0);assert.equal(await p.locator('#'+row.root).evaluate(e=>getComputedStyle(e).getPropertyValue('--nav-h').trim()),'0px');assert.equal(await p.locator('h1').count(),1);
  }else if(job.width===1440){
   const buttons=p.locator('[data-'+P+'-dd-btn]'),first=buttons.first(),group=await first.getAttribute('aria-controls'),panel=p.locator('#'+group),links=panel.locator('a');assert((await buttons.count())>=3);
   await first.hover();assert.equal(await first.getAttribute('aria-expanded'),'true');await p.mouse.move(5,5);await p.waitForTimeout(230);assert.equal(await first.getAttribute('aria-expanded'),'false');
   await first.focus();await p.keyboard.press('ArrowDown');assert.equal(await links.first().evaluate(e=>document.activeElement===e),true);await p.keyboard.press('End');assert.equal(await links.last().evaluate(e=>document.activeElement===e),true);await p.keyboard.press('Home');assert.equal(await links.first().evaluate(e=>document.activeElement===e),true);await p.keyboard.press('ArrowUp');assert.equal(await links.last().evaluate(e=>document.activeElement===e),true);await p.keyboard.press('Escape');assert.equal(await first.getAttribute('aria-expanded'),'false');assert.equal(await first.evaluate(e=>document.activeElement===e),true);
   await first.click();await p.mouse.click(5,5);assert.equal(await first.getAttribute('aria-expanded'),'false');
   await p.locator('#'+row.root).evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY+300,behavior:'instant'}));await p.waitForTimeout(120);assert.equal(await hdr.evaluate(e=>/hdr--stuck/.test(e.className)),true);assert(Math.abs(await p.locator('.'+P+'-hdr__bar').evaluate(e=>e.getBoundingClientRect().top))<=1,'sticky visible nav bar');
  }else{
   await burger.click();assert.equal(await p.evaluate(()=>document.body.style.overflow),'hidden');const close=p.locator('[data-'+P+'-menu-x]');assert.equal(await close.evaluate(e=>document.activeElement===e),true);
   await drawer.evaluate(e=>e.querySelector('a[href],button:not([disabled])').focus());await p.keyboard.press('Shift+Tab');assert.equal(await drawer.evaluate(e=>document.activeElement===[...e.querySelectorAll('a[href],button:not([disabled])')].at(-1)),true);await p.keyboard.press('Tab');assert.equal(await drawer.evaluate(e=>document.activeElement===e.querySelector('a[href],button:not([disabled])')),true);
   const accordion=p.locator('[data-'+P+'-acc]').first(),before=await accordion.getAttribute('aria-expanded');await accordion.click();assert.notEqual(await accordion.getAttribute('aria-expanded'),before);
   await p.keyboard.press('Escape');assert.equal(await drawer.isVisible(),false);assert.equal(await p.evaluate(()=>document.body.style.overflow),'scroll');assert.equal(await burger.evaluate(e=>document.activeElement===e),true);
   await burger.click();const unavailable=drawer.locator('a[aria-disabled="true"]:visible').last();await unavailable.focus();await p.keyboard.press('Enter');assert.equal(new URL(p.url()).hash,'');assert.equal(await p.locator('.'+P+'-status, .'+P+'-link-status').textContent(),'This destination is not yet available.');assert.equal(await p.evaluate(()=>document.body.style.overflow),'scroll');
   await burger.click();await p.setViewportSize({width:1440,height:900});await p.waitForTimeout(120);assert.equal(await drawer.isVisible(),false);assert.equal(await p.evaluate(()=>document.body.style.overflow),'scroll');
  }
  await p.evaluate(k=>window[k].destroy(),row.owner);assert.equal(await p.evaluate(()=>document.body.style.overflow),'scroll');
 }catch(e){c.status='FAIL';c.error=e.message;}finally{await p.close();report.cases.push(c);fs.writeFileSync(path.join(out,requested?'chrome-targeted.json':'chrome.json'),JSON.stringify(report,null,2)+'\n');console.log(c.status+' chrome '+row.slug+' '+job.scenario+' '+job.width+' '+job.kind+(c.error?' '+c.error.split('\n')[0]:''));}
}}finally{await browser.close();}if(report.cases.some(c=>c.status==='FAIL')||report.errors.length||report.console.length||report.network.length)process.exitCode=1;})().catch(e=>{console.error(e);process.exitCode=1;});
