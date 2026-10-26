#!/usr/bin/env node
// Current shared behavior across all standalone blocks. Local fixtures never enter production settings.
'use strict';
const assert=require('node:assert/strict'),{chromium}=require('playwright');
const {fs,path,out,manifest,block,parse,withConfig,host}=require('./common');
const base=(process.argv[2]||'http://127.0.0.1:8123').replace(/\/$/,'');
const arg=n=>process.argv.find(a=>a.startsWith('--'+n+'='))?.split('=').slice(1).join('=');
const all=manifest(),slugs=arg('slugs')?.split(','),rows=slugs?all.filter(r=>slugs.includes(r.slug)):all,widths=arg('widths')?.split(',').map(Number)||[390,1440],variants=arg('variants')?.split(',')||['inline','hosted'];
const result={date:new Date().toISOString(),scope:'Shared navigation, lifecycle and key-control smoke; not final full page regression',cases:[],errors:[],consoleErrors:[],network:[]};
async function run(browser,row,width,variant){
 const p=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce',hasTouch:width===390});
 const name=row.slug+' '+width+' '+variant,local={errors:[],console:[],network:[]};
 p.on('pageerror',e=>local.errors.push(String(e)));p.on('console',m=>{if(m.type()==='error'&&!/fonts\.(googleapis|gstatic)/.test(m.location().url))local.console.push(m.text());});
 p.on('requestfailed',r=>{if(!/fonts\.(googleapis|gstatic)/.test(r.url())&&r.failure().errorText!=='net::ERR_ABORTED')local.network.push(r.url()+': '+r.failure().errorText);});
 p.on('response',r=>{if(r.status()>=400)local.network.push(r.url()+': '+r.status());});
 await p.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,r=>r.abort());
 const assets=new Map();let assetId=0;
 function images(v){if(typeof v==='string'&&v.startsWith('data:image/')){const url=base+'/__qa__/asset/'+row.slug+'/'+assetId++;assets.set(url,v);return url;}if(Array.isArray(v))return v.map(images);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,images(x)]));return v;}
 const extra=variant==='hosted'?images(row.cfg):{};extra.footer={...row.cfg.footer,regulatoryLine:'Local QA regulatory line'};
 let html=withConfig(block(row.slug,variant),extra);const P=row.prefix,R='#'+row.root,status='.'+P+'-status, .'+P+'-link-status';
 await p.route('**/__qa__/asset/**',r=>{const data=assets.get(r.request().url());assert(data,'Unknown image fixture');const m=data.match(/^data:([^;]+);base64,(.*)$/s);return r.fulfill({contentType:m[1],body:Buffer.from(m[2],'base64')});});
 await p.route('**/__qa__/destination/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Local QA destination</title><p>QA only</p>'}));
 await p.route(base+'/__qa__/sync/'+row.slug+'.html',r=>r.fulfill({contentType:'text/html',body:host(html,true,true)}));
 try {
  await p.goto(base+'/__qa__/sync/'+row.slug+'.html',{waitUntil:'domcontentloaded'});
  await p.waitForFunction(k=>window[k]&&window[k].instance,row.owner);
  assert.equal(await p.locator(R+' h1').count(),1);assert.equal(await p.locator(R+' h1').isVisible(),true);
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'overflow');
  assert.equal(await p.locator(R+' '+status.split(',').map(s=>s.trim()).join(', '+R+' ')).count(),1,'one status');
  assert.equal(await p.locator('.'+P+'-sft__reg').count(),1);
  const foot=p.locator('[data-'+P+'-footer] a[data-'+P+'-link="betterWorldImpact"]');
  assert.equal(await foot.getAttribute('href'),'#');assert.equal(await foot.getAttribute('aria-disabled'),'true');await foot.focus();await p.keyboard.press('Enter');assert.equal(new URL(p.url()).hash,'');
  assert.equal(await p.locator(status).innerText(),'This destination is not yet available.');
  if(width<1280){await p.locator('[data-'+P+'-menu-open]').click();assert.equal(await p.evaluate(()=>document.body.style.overflow),'hidden');}
  const chosen=await p.evaluate(P=>{const s=document.querySelector('select[data-'+P+'-select],select[data-'+P+'-gn-select]');if(!s)return null;const o=[...s.options].find((o,i)=>i!==s.selectedIndex&&o.disabled);return o?{key:o.getAttribute('data-'+P+'-link')||o.value,gov:o.hasAttribute('data-'+P+'-link')}:null;},P);
  const url=base+'/__qa__/destination/impact?slug='+row.slug;
  await p.evaluate(({id,url,P,chosen})=>{
   const c=document.getElementById(id),v=JSON.parse(c.textContent);v.links.betterWorldImpact=url;v.links.contact=url;if(chosen)v.links[chosen.key]=url;
   for(const key of Object.keys(v.links))if(/^profile[A-Z]/.test(key))v.links[key]=url+'&campaign=sync#biography';
   v.footer={...v.footer,regulatoryLine:'Updated local QA regulatory line'};c.textContent=JSON.stringify(v).replace(/</g,'\\u003c');
   const host=document.getElementById('sync-host');host.replaceWith(host.cloneNode(true));
  },{id:row.config,url,P,chosen});
  await p.waitForFunction(({key,id})=>window[key]?.root===document.getElementById(id),{key:row.owner,id:row.root});
  assert.equal(await p.evaluate(()=>document.body.style.overflow),'scroll','ancestor replacement restores exact host overflow');
  assert.equal(await p.locator('.'+P+'-sft__reg').count(),1);assert.equal(await p.locator('.'+P+'-sft__reg').innerText(),'Updated local QA regulatory line');
  assert.equal(await foot.getAttribute('href'),url);assert.equal(await foot.getAttribute('aria-disabled'),null);assert.equal(await foot.getAttribute('title'),null);
  if(chosen){const o=p.locator(chosen.gov?'option[data-'+P+'-link="'+chosen.key+'"]':'option[value="'+chosen.key+'"]');assert.equal(await o.isDisabled(),false);assert.equal(await o.getAttribute('label'),null);}
  const from=p.locator('a[data-'+P+'-from]');if(await from.count()){const u=new URL(await from.first().getAttribute('href'));assert.equal(u.searchParams.get('campaign'),'sync');assert.equal(u.searchParams.getAll('from').length,1);assert.equal(u.hash,'#biography');}
  await p.evaluate(k=>window.__syncOwner=window[k],row.owner);await p.addScriptTag({content:row.runtime});assert.equal(await p.evaluate(k=>window.__syncOwner===window[k],row.owner),true,'duplicate execution reuses owner');
  if(width<1280){await p.locator('[data-'+P+'-menu-open]').click();await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>document.body.style.overflow),'scroll');}
  // Remove and restore the ancestor without scroll/resize events or script execution.
  await p.evaluate(()=>{const h=document.getElementById('sync-host');window.__syncHost=h.cloneNode(true);h.remove();});
  await p.waitForFunction(k=>window[k]&&window[k].root===null,row.owner);assert.equal(await p.evaluate(()=>document.body.style.overflow),'scroll');
  await p.evaluate(()=>document.body.appendChild(window.__syncHost));await p.waitForFunction(({key,id})=>window[key]?.root===document.getElementById(id),{key:row.owner,id:row.root});
  assert.equal(await p.locator('.'+P+'-sft__reg').count(),1);assert.equal(await p.locator(status).count(),1);
  // Existing feature controllers must still respond after replacement.
  if(row.slug==='main'){await p.locator('[data-bw-eng-step="2"] .lp-dot').click();assert.equal(await p.locator('[data-bw-eng-step="2"]').getAttribute('aria-selected'),'true');}
  if(row.slug==='financial-engine'){await p.locator('[data-fe-eng-step="2"] .lp-dot').click();assert.equal(await p.locator('[data-fe-eng-step="2"]').getAttribute('aria-selected'),'true');}
  if(row.slug==='ecosystem'){await p.locator('[data-eco-lens="sme"]').click();assert.equal(await p.locator('[data-eco-lens="sme"]').getAttribute('aria-selected'),'true');}
  if(row.slug==='platforms'){await p.locator('[data-plt-view="list"]').click();assert.equal(await p.locator('[data-plt-view="list"]').getAttribute('aria-pressed'),'true');}
  await foot.click();await p.waitForURL(url);
  assert.deepEqual(local.errors,[]);assert.deepEqual(local.console,[]);assert.deepEqual(local.network,[]);
  result.cases.push({slug:row.slug,width,variant,status:'PASS',checks:['unavailable/approved independent Impact','copied footer/link/option state','ancestor replacement and delayed reinsertion without events','duplicate owner and cleanup','profile context preserved','existing controls smoke','configured navigation']});console.log('PASS '+name);
 } catch(e){result.cases.push({slug:row.slug,width,variant,status:'FAIL',error:e.message});console.log('FAIL '+name+': '+e.message);}
 finally {result.errors.push(...local.errors.map(x=>name+': '+x));result.consoleErrors.push(...local.console.map(x=>name+': '+x));result.network.push(...local.network.map(x=>name+': '+x));await p.close();}
}
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{for(const row of rows)for(const width of widths)for(const variant of variants)await run(b,row,width,variant);}finally{await b.close();}fs.writeFileSync(path.join(out,slugs||arg('widths')||arg('variants')?'browser-partial.json':'browser.json'),JSON.stringify(result,null,2)+'\n');if(result.cases.some(c=>c.status==='FAIL')||result.errors.length||result.consoleErrors.length||result.network.length)process.exitCode=1;})().catch(e=>{console.error(e);process.exitCode=1;});
