#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),{chromium}=require('playwright');
const {fs,path,out,manifest,block,withConfig}=require('./common');
const base=(process.argv[2]||'http://127.0.0.1:8123').replace(/\/$/,'');
const result={date:new Date().toISOString(),scope:'First execution before markup, duplicate pending bootstrap, explicit owner teardown/reboot',cases:[],errors:[]};
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{for(const row of manifest()){
 const p=await b.newPage({viewport:{width:390,height:900},reducedMotion:'reduce'});p.on('pageerror',e=>result.errors.push(row.slug+': '+e));await p.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,r=>r.abort());
 await p.route(base+'/__qa__/deferred.html',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0}</style></head><body style="overflow:auto"><div id="mount"></div></body></html>'}));
 try{
  await p.goto(base+'/__qa__/deferred.html');await p.addScriptTag({content:row.runtime});await p.evaluate(k=>window.__firstOwner=window[k],row.owner);await p.addScriptTag({content:row.runtime});assert.equal(await p.evaluate(k=>window.__firstOwner===window[k],row.owner),true);
  const html=withConfig(block(row.slug),{footer:{regulatoryLine:'Local deferred QA line'}});await p.locator('#mount').evaluate((el,html)=>{el.innerHTML=html;},html);
  await p.waitForFunction(({key,id})=>window[key]?.root===document.getElementById(id)&&window[key].instance,{key:row.owner,id:row.root});
  const status='.'+row.prefix+'-status, .'+row.prefix+'-link-status';assert.equal(await p.locator(status).count(),1);assert.equal(await p.locator('.'+row.prefix+'-sft__reg').count(),1);
  await p.locator('[data-'+row.prefix+'-menu-open]').click();assert.equal(await p.evaluate(()=>document.body.style.overflow),'hidden');
  await p.evaluate(k=>window[k].destroy(),row.owner);assert.equal(await p.evaluate(k=>window[k],row.owner),undefined);assert.equal(await p.evaluate(()=>document.body.style.overflow),'auto');assert.equal(await p.locator(status).count(),0);
  await p.locator('#mount').evaluate(el=>el.appendChild(document.createElement('span')));await p.waitForTimeout(80);assert.equal(await p.evaluate(k=>window[k],row.owner),undefined);
  await p.addScriptTag({content:row.runtime});await p.waitForFunction(k=>!!window[k]?.instance,row.owner);assert.equal(await p.locator(status).count(),1);assert.equal(await p.locator('.'+row.prefix+'-sft__reg').count(),1);assert.equal(await p.locator('[data-'+row.prefix+'-drawer]').isVisible(),false);
  result.cases.push({slug:row.slug,status:'PASS'});console.log('PASS deferred/destroy '+row.slug);
 }catch(e){result.cases.push({slug:row.slug,status:'FAIL',error:e.message});console.log('FAIL deferred/destroy '+row.slug+': '+e.message);}finally{await p.close();}
}}finally{await b.close();}fs.writeFileSync(path.join(out,'deferred.json'),JSON.stringify(result,null,2)+'\n');if(result.cases.some(x=>x.status==='FAIL')||result.errors.length)process.exitCode=1;})().catch(e=>{console.error(e);process.exitCode=1;});
