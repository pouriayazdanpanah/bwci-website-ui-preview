#!/usr/bin/env node
// Compare the confirmed Main CTA update against the actual source; no build workflow is added to Main.
'use strict';
const assert=require('node:assert/strict'),{chromium}=require('playwright');
const {fs,path,out,block,parse,withConfig,host}=require('./common');
const routeReact=require('../../../../pages/main/qa/qa-routes');
const base=(process.argv[2]||'http://127.0.0.1:8123').replace(/\/$/,'');
const widths=[320,360,375,390,430,768,1024,1280,1366,1440,1600,1920,2560];
const jobs=widths.map(width=>({width,height:900})).concat([{width:390,height:600},{width:1440,height:600},{width:1440,height:1200}]);
const result={date:new Date().toISOString(),scope:'Main CTA only: new background/dots, source geometry/styles, both variants; fallback fonts, local QA',cases:[],errors:[],console:[],network:[]};
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{for(const job of jobs){let reference;
 for(const kind of ['source','inline','hosted']){
  const p=await b.newPage({viewport:job,reducedMotion:'reduce'});await routeReact(p);await p.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,r=>r.abort());
  p.on('pageerror',e=>result.errors.push(String(e)));p.on('console',m=>{if(m.type()==='error'&&!/fonts\.(googleapis|gstatic)/.test(m.location().url))result.console.push(m.text());});
  p.on('requestfailed',r=>{if(!/fonts\.(googleapis|gstatic)/.test(r.url())&&r.failure().errorText!=='net::ERR_ABORTED')result.network.push(r.url()+': '+r.failure().errorText);});
  p.on('response',r=>{if(r.status()>=400)result.network.push(r.url()+': '+r.status());});
  const port=kind!=='source',selector=port?'#bwci-cta':'#cta';
  if(port){const html=kind==='inline'?block('main'):withConfig(block('main','hosted'),parse(block('main')).cfg);await p.route(base+'/__qa__/main-cta.html',r=>r.fulfill({contentType:'text/html',body:host(html)}));}
  try{
   await p.goto(port?base+'/__qa__/main-cta.html':base+'/design/Main.dc.html',{waitUntil:'domcontentloaded'});await p.waitForTimeout(3100);await p.locator(selector).evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.waitForTimeout(1300);
   const data=await p.locator(selector).evaluate(e=>{const cs=getComputedStyle(e),ps=getComputedStyle(e,'::before'),r=e.getBoundingClientRect();return {width:r.width,height:r.height,paddingTop:cs.paddingTop,paddingBottom:cs.paddingBottom,background:cs.backgroundImage,dots:ps.backgroundImage,size:ps.backgroundSize,mask:ps.maskImage,text:e.innerText.replace(/\s+/g,' ').trim()};});
   if(!port)reference=data;else assert.deepEqual(data,reference,'CTA source geometry/style/text '+job.width+' '+kind);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   const screenshot='main-cta-'+kind+'-'+job.width+'-'+job.height+'.png';await p.locator(selector).screenshot({path:path.join(out,screenshot),animations:'disabled'});
   result.cases.push({...job,kind,status:'PASS',data,screenshot});console.log('PASS Main CTA '+job.width+'x'+job.height+' '+kind);
  }finally{await p.close();}
 }
}}finally{await b.close();}
assert.deepEqual(result.errors,[]);assert.deepEqual(result.console,[]);assert.deepEqual(result.network,[]);fs.writeFileSync(path.join(out,'main-visual.json'),JSON.stringify(result,null,2)+'\n');})().catch(e=>{console.error(e);process.exitCode=1;});
