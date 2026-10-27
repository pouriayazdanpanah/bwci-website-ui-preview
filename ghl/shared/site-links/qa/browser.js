#!/usr/bin/env node
// Model GHL's text substitution locally; this is not a live GHL rendering test.
'use strict';
const assert=require('node:assert/strict'),{chromium}=require('playwright'),links=require('..');
const {fs,path,manifest,block,withConfig,host,parse}=require('../../site-chrome/qa/sync/common');
const out=path.join(__dirname,'output');fs.mkdirSync(out,{recursive:true});
const requested=process.argv.find(a=>a.startsWith('--slugs='))?.slice(8).split(',');
const report={date:new Date().toISOString(),cases:[],errors:[],console:[],network:[],liveGHL:'NOT VERIFIED'};
function values(mode){return Object.fromEntries(links.snapshot.customValues.map(f=>{
 let value=f.value;if(mode==='empty')value='';
 if(mode==='available')value=f.name.endsWith('_email')?'mailto:'+f.name+'@example.test':f.name.endsWith('_phone')?'tel:+440000000000':'https://bwci.qa.invalid/'+f.name+'?utm_source=qa%2Ctest&x=1#landing';
 return [f.fieldKey,value];
}));}
function substitute(html,mode){if(mode==='raw')return html;for(const [key,value]of Object.entries(values(mode)))html=html.split(key).join(value);return html;}
async function fixture(p,row,kind,mode){
 let html=block(row.slug,kind);if(kind==='hosted'){
  let id=0;const assets=new Map();function change(v){if(typeof v==='string'&&v.startsWith('data:image/')){const url='https://bwci.qa.invalid/__asset/'+id++;assets.set(url,v);return url;}if(Array.isArray(v))return v.map(change);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,change(x)]));return v;}
  html=withConfig(html,change(row.cfg));await p.route('https://bwci.qa.invalid/__asset/**',r=>{const v=assets.get(r.request().url());assert(v,'Mock image exists');const m=v.match(/^data:([^;]+);base64,(.*)$/s);return r.fulfill({contentType:m[1],body:Buffer.from(m[2],'base64')});});
 }
 return substitute(html,mode);
}
function expected(row,mode){const cfg=JSON.parse(JSON.stringify(row.cfg));for(const [key,raw]of Object.entries(cfg.links)){
 if(links.local(key,row.slug))continue;
 if(mode!=='available'){cfg.links[key]='#';continue;}
 const base=values(mode)[links.fieldFor(key).fieldKey];cfg.links[key]=links.sections[key]?base.split('#')[0]+links.sections[key][1]:base;
}return cfg.links;}
async function navigation(p,row,wanted){
 const observed=await p.evaluate(P=>[...document.querySelectorAll('a[data-'+P+'-link]')].map(a=>({key:a.getAttribute('data-'+P+'-link'),href:a.getAttribute('href'),disabled:a.getAttribute('aria-disabled'),from:a.getAttribute('data-'+P+'-from')})),row.prefix);
 assert(observed.length>20,'All navigation rendered');
 for(const a of observed){let url=wanted[a.key];assert.equal(typeof url,'string',a.key+' has config mapping');if(a.from&&url!=='#'){
  const u=new URL(url,'https://bwci.qa.invalid');u.searchParams.append('from',a.from);url=u.href;
 }
  // Existing person-card code appends query text without rewriting unrelated query encoding.
  if(a.from&&url!=='#'){assert.equal(new URL(a.href,'https://bwci.qa.invalid').href,new URL(url,'https://bwci.qa.invalid').href,a.key+' context URL');}
  else assert.equal(a.href,url,a.key+' URL');
  assert.equal(a.disabled,url==='#'?'true':null,a.key+' availability');
 }
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');return observed.length;
}
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{
 for(const row of manifest().filter(r=>!requested||requested.includes(r.slug)))for(const kind of ['inline','hosted'])for(const mode of ['snapshot','available','raw','empty']){
  const rec={slug:row.slug,kind,mode,status:'PASS'},p=await browser.newPage({viewport:{width:mode==='available'||mode==='empty'?390:1440,height:900},reducedMotion:'reduce'});
  await p.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,r=>r.abort());
  p.on('pageerror',e=>report.errors.push(row.slug+' '+mode+': '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts\.(googleapis|gstatic)/.test(m.location().url))report.console.push(row.slug+' '+m.text());});
  p.on('requestfailed',r=>{if(!/fonts\.(googleapis|gstatic)/.test(r.url()))report.network.push(r.url());});
  try{
   const html=await fixture(p,row,kind,mode);parse(html);await p.setContent(host(html,true),{waitUntil:'domcontentloaded'});
   await p.waitForFunction(k=>!!window[k]?.instance,row.owner);await p.waitForFunction(()=>[...document.images].filter(i=>i.getAttribute('src')&&i.loading!=='lazy').every(i=>i.complete&&i.naturalWidth>0));
   const wanted=expected(row,mode);rec.anchorChecks=await navigation(p,row,wanted);
   if(mode!=='available'){
    const a=p.locator('a[data-'+row.prefix+'-link="contact"]').first();await a.dispatchEvent('click');
    assert.match(await p.locator('.'+row.prefix+'-status,.'+row.prefix+'-link-status').first().textContent(),/not yet available/);
   }else{
    const burger=p.locator('[data-'+row.prefix+'-menu-open]');await burger.click();assert.equal(await burger.getAttribute('aria-expanded'),'true');assert.equal(await p.evaluate(()=>document.body.style.overflow),'hidden');
    await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>document.body.style.overflow),'scroll');
    if(row.slug==='main'){
     await p.locator('[data-bw-pf="dev"]').click();assert.equal(await p.locator('.pf-panel a.pk').count(),2);await navigation(p,row,wanted);
    }
    await p.setViewportSize({width:1440,height:900});await navigation(p,row,wanted);
    const footer=p.locator('.'+row.prefix+'-sft a[data-'+row.prefix+'-link="contact"]').first();assert.equal(await footer.getAttribute('href'),wanted.contact);
    // Existing unavailable state and live links must be reset after an ancestor replacement.
    await p.evaluate(k=>{window.__oldLinksInstance=window[k].instance;},row.owner);
    const pending=substitute(block(row.slug,kind==='hosted'?'inline':kind),'snapshot');
    await p.evaluate(html=>{document.querySelector('#sync-host').outerHTML='<section id="sync-host" style="padding:0;background:none">'+html+'</section>';},pending);
    await p.waitForFunction(k=>!!window[k]?.instance&&window[k].instance!==window.__oldLinksInstance,row.owner);
    await navigation(p,row,expected(row,'snapshot'));assert.equal(await p.evaluate(()=>document.body.style.overflow),'scroll');
    // Exercise a real selector/footer navigation against an intercepted destination, without GHL access.
    await p.evaluate(k=>{window.__oldLinksInstance=window[k].instance;},row.owner);
    await p.evaluate(html=>{document.querySelector('#sync-host').outerHTML='<section id="sync-host" style="padding:0;background:none">'+html+'</section>';},html);
    await p.waitForFunction(k=>!!window[k]?.instance&&window[k].instance!==window.__oldLinksInstance,row.owner);
    await p.setViewportSize({width:390,height:900});
    await p.route('https://bwci.qa.invalid/bwci_url_*',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><p>Mock navigation destination</p>'}));
    const select=p.locator('[data-'+row.prefix+'-select], [data-'+row.prefix+'-gn-select]');
    if(await select.count()){
     const option=await select.evaluate((s,wanted)=>[...s.options].map((o,index)=>({index,url:wanted[o.value]||o.value,disabled:o.disabled,selected:o.selected})).find(o=>!o.selected&&!o.disabled&&o.url.startsWith('https://bwci.qa.invalid/')),wanted);
     assert(option,'Available selector destination');rec.navigationTarget=option.url;await select.selectOption({index:option.index});
    }else{
     rec.navigationTarget=wanted.contact;await p.locator('.'+row.prefix+'-sft a[data-'+row.prefix+'-link="contact"]').first().click();
    }
    await p.waitForURL(rec.navigationTarget);assert.match(await p.locator('body').innerText(),/Mock navigation destination/);
   }
  }catch(e){rec.status='FAIL';rec.error=e.message;}finally{await p.close();report.cases.push(rec);fs.writeFileSync(path.join(out,requested?'browser-targeted.json':'browser.json'),JSON.stringify(report,null,2)+'\n');console.log(rec.status+' '+row.slug+' '+kind+' '+mode+(rec.error?' '+rec.error.split('\n')[0]:''));}
 }
}finally{await browser.close();}if(report.cases.some(c=>c.status==='FAIL')||report.errors.length||report.console.length||report.network.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
