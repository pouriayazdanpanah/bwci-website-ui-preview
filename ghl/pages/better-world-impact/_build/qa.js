#!/usr/bin/env node
// Local browser QA. Requires Playwright and Chromium; no QA dependency is shipped in the GHL blocks.
// First run build.js and make-previews.js, then serve the repo on loopback:
// python3 -m http.server 8123 --bind 127.0.0.1
// node ghl/pages/better-world-impact/_build/qa.js http://127.0.0.1:8123
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const routeReact = require('../../governance/_build/qa-routes');
const base = (process.argv[2] || 'http://127.0.0.1:8123').replace(/\/$/, '');
const out = path.join(__dirname, 'qa-output');
const preview = base + '/ghl/pages/better-world-impact/_build/preview/';
const source = base + '/design/Better%20World%20Impact.dc.html';
const root = '#bwci-better-world-impact';
const fixture={evidence:[{value:'QA-only value',label:'Local fixture only',date:'[QA date]',source:'Local QA fixture'}],cases:[{label:'QA ONLY',title:'Local QA case fixture',summary:'Local fixture. Not a published case study.',href:base+'/__qa__/case',img:base+'/design/assets/bwci-logo.png',alt:'Local QA image'}]};
const widths = [320,360,375,390,430,767,768,1023,1024,1280,1366,1440,1600,1920,2560];
const results = { frames: 'Infinite decorative artwork drift captured at t=0 via screenshot animations:disabled; real motion checked separately', date: new Date().toISOString(), base, fonts: 'NOT VERIFIED: remote font requests deliberately blocked; both references use identical fallback fonts', matrix: [], checks: [], errors: [], consoleErrors: [], unexpectedNetwork: [] };
let browser;
const errors = results.errors;
async function pageFor(width = 1440, height = 900, opts = {}) {
  const p = await browser.newPage({ viewport: {width, height}, reducedMotion: opts.motion ? 'no-preference' : 'reduce', hasTouch: !!opts.touch });
  await routeReact(p);
  await p.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//, r => r.abort());
  p.on('pageerror', e => errors.push(String(e)));
  p.on('console', message => {
    if(message.type()==='error' && !/fonts\.(googleapis|gstatic)\.com/.test(message.location().url))
      results.consoleErrors.push({text:message.text(),location:message.location()});
  });
  p.on('requestfailed', r => { if (!/fonts\.(googleapis|gstatic)\.com/.test(r.url()) && r.failure().errorText !== 'net::ERR_ABORTED') results.unexpectedNetwork.push({url:r.url(),error:r.failure().errorText}); });
  p.on('response', r => { if (r.status() >= 400) results.unexpectedNetwork.push({url:r.url(),status:r.status()}); });
  if(opts.sourceConfig){
    await p.route('**/design/Better%20World%20Impact.dc.html',async r=>{
      const response=await r.fetch();
      const body=(await response.text()).replace(/data-props="([^"]*)"/,(_,encoded)=>{
        const props=JSON.parse(encoded.replace(/&quot;/g,'"').replace(/&amp;/g,'&'));
        for(const key of ['showMethodology'])if(Object.hasOwn(opts.sourceConfig,key))props[key].default=opts.sourceConfig[key];
        return 'data-props="'+JSON.stringify(props).replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'"';
      });
      const adjusted=body.replace('const evidence = [];','const evidence = '+JSON.stringify(opts.sourceConfig.evidence||[])+';').replace('const cases = [].map','const cases = '+JSON.stringify(opts.sourceConfig.cases||[])+'.map');
      await r.fulfill({response,body:adjusted});
    });
  }
  if (opts.config) {
    await p.route('**/preview/*.html', async r => {
      const response = await r.fetch();
      const body = (await response.text()).replace(/(<script type="application\/json" id="bwci-better-world-impact-config">)([\s\S]*?)(<\/script>)/, (_,a,json,z) => {
        const cfg = JSON.parse(json);
        const value = {...cfg, ...opts.config, links:{...cfg.links, ...opts.config.links}};
        return a + JSON.stringify(value).replace(/</g,'\\u003c') + z;
      });
      await r.fulfill({response,body});
    });
  }
  return p;
}
async function settle(p) {
  await p.bringToFront();
  await p.waitForTimeout(2900); // last source/shared reveal scan is at 2600ms
  await p.evaluate(async () => {
    for(let y=0;y<document.documentElement.scrollHeight;y+=Math.round(innerHeight*.65)) {
      window.scrollTo({top:y,behavior:'instant'});
      await new Promise(r=>setTimeout(r,65));
    }
    await new Promise(r=>setTimeout(r,1300));
    window.scrollTo({top:0,behavior:'instant'});
  });
  await p.waitForTimeout(400);
  // Background tabs can defer intersection delivery. Bring each still-unrevealed block into view;
  // do not alter source/port classes or force visibility for the comparison.
  const hidden = p.locator('.sr:not(.in), .bwi-sr:not(.bwi-in), [data-bw-rv="wait"]');
  let recovered=false;
  for (const el of await hidden.all()) {
    if (!await el.isVisible()) continue;
    await el.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
    await p.waitForTimeout(120);
    recovered=true;
  }
  if(recovered)await p.waitForTimeout(1300);
  // Verify the end state as well as the observer classes: a hidden ancestor may otherwise make a
  // screenshot look empty even when a child already has its own revealed class.
  const blocks = p.locator('main h1,main h2,main h3,main p,main figure');
  for (const el of await blocks.all()) {
    if (!await el.isVisible()) continue;
    const opaque = () => el.evaluate(e=>{
      for(let a=e;a&&a!==document.documentElement;a=a.parentElement)
        if(Number(getComputedStyle(a).opacity)<.999)return false;
      return true;
    });
    if (await opaque()) continue;
    await p.bringToFront();
    await el.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
    await p.waitForTimeout(1500);
    assert.equal(await opaque(),true,'Scroll reveal did not settle');
  }
  await p.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
}
async function geometry(p, port) {
  return p.evaluate(({port,root}) => {
    const scope = document.querySelector(port ? root : '.bw');
    const sections = [...scope.querySelectorAll('main section')].filter(el=>el.offsetHeight>0).map(el=>({
      label:el.getAttribute('data-screen-label'), y:Math.round(el.getBoundingClientRect().y - scope.getBoundingClientRect().y), height:Math.round(el.getBoundingClientRect().height)
    }));
    return {height:Math.round(scope.getBoundingClientRect().height),docW:document.documentElement.scrollWidth,sections};
  },{port,root});
}
async function check(name, fn) {
  try { await fn(); results.checks.push({name,status:'PASS'}); console.log('PASS '+name); }
  catch(e) { results.checks.push({name,status:'FAIL',error:e.message}); console.log('FAIL '+name+': '+e.message); }
}
async function capture(width,height=900,motion=false,scenario='default') {
  const state=scenario==='method-off'?{showMethodology:false}:scenario==='approved-data'?fixture:{};
  const suffix=(motion?'-motion':'')+(scenario==='default'?'':'-'+scenario);
  const row={width,height,motion,scenario,status:'PASS',variants:[]};let reference;
  for(const kind of ['source','plain','hosted']) {
    const p=await pageFor(width,height,{motion,sourceConfig:scenario==='default'?undefined:state,config:kind==='hosted'?{...state,logoImage:base+'/design/assets/bwci-logo.png',impactHeroImage:base+'/design/assets/impact-hero-ribbons.png'}:scenario==='default'?undefined:state});
    try {
      await p.goto(kind==='source'?source:preview+kind+'.html',{waitUntil:'domcontentloaded'});await settle(p);
      const g=await geometry(p,kind!=='source');if(g.docW>width)throw Error('Horizontal overflow '+kind+' '+width);
      if(kind==='source')reference=g;else assert.deepEqual(g,reference,'Section geometry '+kind+' '+width+'x'+height);
      if(kind!=='source'){
        assert.equal(await p.locator('main section:visible').count(),scenario==='method-off'?4:scenario==='approved-data'?7:5);
        assert.equal(await p.locator('[data-bwi-asset]').evaluateAll(xs=>xs.every(x=>x.complete&&x.naturalWidth>0)),true);
      }
      const filename=`${kind}-${width}-${height}${suffix}.png`;await p.screenshot({path:path.join(out,filename),fullPage:true,animations:'disabled'});
      row.variants.push({kind,...g,screenshot:filename});
    } finally {await p.close();}
  }
  results.matrix.push(row);console.log('PASS matrix '+width+'x'+height+' '+scenario+(motion?' motion':''));
}
(async()=>{
 fs.mkdirSync(out,{recursive:true});browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 let jobs=widths.map(w=>[w,900,false]).concat([[390,600,false],[1024,1200,false],[1440,600,false],[390,900,true],[1440,900,true],[390,900,false,'method-off'],[1440,900,false,'method-off'],[390,900,false,'approved-data'],[1440,900,false,'approved-data']]);
 const recapture=process.argv.find(a=>a.startsWith('--recapture='));if(recapture)jobs=jobs.filter(j=>j.join('x')===recapture.slice('--recapture='.length));
 if(!process.argv.includes('--checks-only'))for(const job of jobs)await check('capture '+job.join('x'),()=>capture(...job));
 if(!process.argv.includes('--matrix-only')){
 await check('Source content, static six-stage diagram and empty launch data',async()=>{
  const p=await pageFor();await p.goto(preview+'plain.html');assert.equal(await p.locator('h1').innerText(),'Impact should influence the architecture of capital itself.');
  assert.equal(await p.locator('main section:visible').count(),5);assert.equal(await p.locator('#bwi-evidence').isVisible(),false);assert.equal(await p.locator('#bwi-cases').isVisible(),false);
  assert.equal(await p.locator('#bwi-engine figure').getAttribute('role'),'img');assert.equal(await p.locator('#bwi-engine button').count(),0);
  assert.equal(await p.locator('.bwi-lp-n').count(),6);assert.equal(await p.locator('.bwi-lp-n.bwi-is-on').count(),3);
  assert.deepEqual(await p.locator('.bwi-lp-n.bwi-is-on .bwi-lp-t').allTextContents(),['Architecture','Institution','Reinvestment']);
  const labels=await p.locator('.bwi-lp-t').allTextContents();assert.deepEqual(labels,['Need','Architecture','Institution','Capital','Activity','Reinvestment']);
  assert.equal(await p.locator('.bwi-lp-tag').count(),3);await p.locator('.bwi-lp-t').first().click();assert.deepEqual(await p.locator('.bwi-lp-t').allTextContents(),labels);
  assert.equal(await p.locator('main button').count(),0);assert.equal(await p.locator('a[data-bwi-link="betterWorldImpact"][aria-current="page"]').count(),2);assert.equal(await p.locator('x-dc,sc-if,sc-for,dc-import').count(),0);
  assert.equal(await p.locator('[aria-label="Breadcrumb"] [aria-current="page"]').innerText(),'Better World & Impact');await p.close();
 });
 await check('Methodology switch, malformed JSON and invalid image/data defaults',async()=>{
  const p=await pageFor(390,900,{config:{showMethodology:false,evidence:[{value:'Incomplete'}],cases:[{title:'Incomplete'}],impactHeroImage:'javascript:alert(1)'}});await p.goto(preview+'plain.html');
  assert.equal(await p.locator('#bwi-methodology').isVisible(),false);assert.equal(await p.locator('#bwi-evidence').isVisible(),false);assert.equal(await p.locator('#bwi-cases').isVisible(),false);assert.equal(await p.locator('[data-bwi-asset="impactHeroImage"]').getAttribute('src'),null);await p.close();
  const q=await pageFor();await q.route('**/preview/plain.html',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace(/("showMethodology":) true/,'$1 INVALID')});});await q.goto(preview+'plain.html');
  assert.equal(await q.locator('#bwi-methodology').isVisible(),true);assert.equal(await q.locator('#bwi-cases').isVisible(),false);await q.close();
 });
 await check('Approved data templates, text safety, case route and cloned-root clearing',async()=>{
  const payload='<img src=x onerror="window.__bwiInjected=true">';const p=await pageFor(390,900,{config:{...fixture,evidence:[{...fixture.evidence[0],label:payload}]}});
  await p.route('**/__qa__/**',r=>r.fulfill({body:'<!doctype html><title>QA case destination</title><p>Local QA only</p>',contentType:'text/html'}));await p.goto(preview+'plain.html');
  assert.equal(await p.locator('#bwi-evidence').isVisible(),true);assert.equal(await p.locator('#bwi-cases').isVisible(),true);assert.equal(await p.locator('#bwi-evidence [data-bwi-field="label"]').innerText(),payload);assert.equal(await p.locator('#bwi-evidence img').count(),0);assert.equal(await p.evaluate(()=>window.__bwiInjected),undefined);
  await p.locator('a[data-bwi-case-link]').click();await p.waitForURL(fixture.cases[0].href);
  await p.goto(preview+'plain.html');await p.evaluate(()=>{const c=document.getElementById('bwci-better-world-impact-config'),v=JSON.parse(c.textContent);v.evidence=[];v.cases=[];c.textContent=JSON.stringify(v);const el=document.getElementById('bwci-better-world-impact');el.replaceWith(el.cloneNode(true));});await p.waitForTimeout(200);
  assert.equal(await p.locator('#bwi-evidence').isVisible(),false);assert.equal(await p.locator('#bwi-cases').isVisible(),false);assert.equal(await p.locator('[data-bwi-cases-list] > a').count(),0);await p.close();
 });
 await check('Configured Contact/Financial Engine links, unavailable feedback and copied footer/route',async()=>{
  const p=await pageFor();await p.goto(preview+'plain.html');const c=p.locator('.bwi-hero-actions [data-bwi-link="contact"]');await c.focus();await p.keyboard.press('Enter');assert.equal(new URL(p.url()).hash,'');assert.equal(await p.locator('.bwi-status').innerText(),'This destination is not yet available.');assert.equal(await c.evaluate(e=>getComputedStyle(e).outlineWidth),'2px');await p.close();
  const links={contact:base+'/__qa__/contact',financialEngineHero:base+'/__qa__/engine',betterWorldImpact:base+'/__qa__/impact'};
  const q=await pageFor(1440,900,{config:{links,footer:{regulatoryLine:'QA footer wording'}}});await q.route('**/__qa__/**',r=>r.fulfill({body:'<!doctype html><title>QA destination</title>',contentType:'text/html'}));
  for(const selector of ['.bwi-hero-actions [data-bwi-link="contact"]','#bwi-next [data-bwi-link="contact"]','#bwi-engine [data-bwi-link="financialEngineHero"]']){await q.goto(preview+'plain.html');const url=await q.locator(selector).getAttribute('href');await q.locator(selector).click();await q.waitForURL(url);}
  await q.goto(preview+'plain.html');await q.locator('.bwi-hdr__trigger[aria-current="page"]').click();await q.locator('.bwi-hdr__panel:not([hidden]) a[data-bwi-link="betterWorldImpact"]').click();await q.waitForURL(links.betterWorldImpact);await q.goto(preview+'plain.html');assert.equal(await q.locator('.bwi-sft__reg').count(),1);await q.evaluate(()=>{const el=document.getElementById('bwci-better-world-impact');el.replaceWith(el.cloneNode(true));});await q.waitForTimeout(200);assert.equal(await q.locator('.bwi-sft__reg').count(),1);assert.equal(await q.locator('.bwi-hero-actions [data-bwi-link="contact"]').getAttribute('aria-disabled'),null);await q.close();
 });
 await check('Scoped anchor, native scroll/wheel, live diagram breakpoint and header switches',async()=>{
  const p=await pageFor(390,600);await p.goto(preview+'plain.html');await p.locator('.bwi-hero-actions a[href="#bwi-approach"]').click();assert.equal(new URL(p.url()).hash,'#bwi-approach');assert((await p.locator('#bwi-approach').boundingBox()).y>=0);
  assert.equal(Math.round((await p.locator('[data-bwi-hdr]').boundingBox()).y),0);const y=await p.evaluate(()=>scrollY);await p.mouse.wheel(0,300);await p.waitForTimeout(200);assert((await p.evaluate(()=>scrollY))>y);
  for(const width of [767,768,1023,1024,1440]){await p.setViewportSize({width,height:900});assert.equal(await p.locator('.bwi-lp-ring').isVisible(),width>=1024);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);}
  await p.close();const q=await pageFor(390,900,{config:{showHeader:false,showFooter:false}});await q.goto(preview+'plain.html');assert.equal(await q.locator('[data-bwi-hdr-host],[data-bwi-footer]').count(),0);await q.close();
 });
 await check('Artwork bytes/composition, normal drift and reduced-motion stop',async()=>{
  for(const motion of [false,true]){const p=await pageFor(1440,900,{motion});await p.goto(preview+'plain.html');const img=p.locator('[data-bwi-asset="impactHeroImage"]');assert.equal(await img.evaluate(e=>e.naturalWidth),2022);assert.equal(await img.evaluate(e=>e.naturalHeight),778);const style=await img.evaluate(e=>({name:getComputedStyle(e).animationName,duration:getComputedStyle(e).animationDuration}));assert.equal(style.name,motion?'bwi-ivDrift':'none');if(motion){assert.equal(style.duration,'14s');const a=await img.evaluate(e=>getComputedStyle(e).transform);await p.waitForTimeout(400);assert.notEqual(await img.evaluate(e=>getComputedStyle(e).transform),a);}await p.close();}
 });
 await check('Hostile host, touch/menu, duplicate script, root replacement and teardown',async()=>{
  const p=await pageFor(390,900,{touch:true});await p.goto(preview+'hostile.html');assert.equal(await p.locator('.bwi-status').count(),1);assert.equal(await p.locator(root).evaluate(e=>getComputedStyle(e).textAlign),'left');assert((await p.locator('h1').evaluate(e=>getComputedStyle(e).fontFamily)).includes('Plus Jakarta Sans'));
  await p.evaluate(()=>document.body.style.overflow='auto');await p.locator('[data-bwi-menu-open]').tap();assert.equal(await p.evaluate(()=>document.body.style.overflow),'hidden');await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>!!document.activeElement.closest('[data-bwi-drawer]')),true);
  await p.evaluate(()=>{const el=document.getElementById('bwci-better-world-impact');el.replaceWith(el.cloneNode(true));});await p.waitForTimeout(200);assert.equal(await p.evaluate(()=>document.body.style.overflow),'auto');assert.equal(await p.locator('.bwi-status').count(),1);await p.locator('[data-bwi-menu-open]').tap();await p.keyboard.press('Escape');assert.equal(await p.locator('[data-bwi-drawer]').isVisible(),false);
  await p.locator('#bwi-approach').evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY,behavior:'instant'}));await p.waitForTimeout(250);assert.equal(Math.round((await p.locator('[data-bwi-hdr]').boundingBox()).y),0);await settle(p);await p.screenshot({path:path.join(out,'hostile-390.png'),fullPage:true,animations:'disabled'});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.equal(await p.locator('.ghl-above').first().evaluate(e=>getComputedStyle(e).color),'rgb(255, 255, 255)');await p.evaluate(()=>window.__bwciBetterWorldImpact.destroy());assert.equal(await p.evaluate(()=>window.__bwciBetterWorldImpact),undefined);assert.equal(await p.locator('.bwi-status').count(),0);await p.close();
 });
 }
 await check('No JS/console errors or unexpected network failures',async()=>{assert.deepEqual(results.errors,[]);assert.deepEqual(results.consoleErrors,[]);assert.deepEqual(results.unexpectedNetwork,[]);});
 await browser.close();fs.writeFileSync(path.join(out,process.argv.includes('--checks-only')?'checks.json':recapture?'recapture.json':'results.json'),JSON.stringify(results,null,2)+'\n');if(results.checks.some(c=>c.status==='FAIL'))process.exitCode=1;
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1;});
