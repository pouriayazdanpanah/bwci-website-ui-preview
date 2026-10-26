#!/usr/bin/env node
// Local browser QA. Requires Playwright and Chromium; no QA dependency is shipped in the GHL blocks.
// First run build.js and make-previews.js, then serve the repo on loopback:
// python3 -m http.server 8123 --bind 127.0.0.1
// node ghl/pages/corporate-ir-reports-documents/_build/qa.js http://127.0.0.1:8123
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const routeReact = require('../../governance/_build/qa-routes');
const base = (process.argv[2] || 'http://127.0.0.1:8123').replace(/\/$/, '');
const out = path.join(__dirname, 'qa-output');
const preview = base + '/ghl/pages/corporate-ir-reports-documents/_build/preview/';
const source = base + '/design/Corporate%20IR.dc.html#reports-documents';
const root = '#bwci-corporate-ir-reports-documents';
const widths = [320,360,375,390,430,768,1024,1099,1100,1101,1280,1366,1440,1600,1920,2560];
const results = { date: new Date().toISOString(), base, fonts: 'NOT VERIFIED: remote font requests deliberately blocked; both references use identical fallback fonts', matrix: [], checks: [], errors: [], consoleErrors: [], unexpectedNetwork: [] };
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
    await p.route('**/design/Corporate%20IR.dc.html',async r=>{
      const response=await r.fetch();
      const body=(await response.text()).replace(/data-props="([^"]*)"/,(_,encoded)=>{
        const props=JSON.parse(encoded.replace(/&quot;/g,'"').replace(/&amp;/g,'&'));
        for(const key of ['documents','showFlags'])if(Object.hasOwn(opts.sourceConfig,key))props[key].default=opts.sourceConfig[key];
        return 'data-props="'+JSON.stringify(props).replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'"';
      });
      await r.fulfill({response,body});
    });
  }
  if (opts.config) {
    await p.route('**/preview/*.html', async r => {
      const response = await r.fetch();
      const body = (await response.text()).replace(/(<script type="application\/json" id="bwci-corporate-ir-reports-documents-config">)([\s\S]*?)(<\/script>)/, (_,a,json,z) => {
        const cfg = JSON.parse(json);
        const value = {...cfg, ...opts.config, links:{...cfg.links, ...opts.config.links}};
        return a + JSON.stringify(value).replace(/</g,'\\u003c') + z;
      });
      await r.fulfill({response,body});
    });
  }
  return p;
}
function controls(p,isSource){
  return isSource?{type:p.locator('.ir-f select').nth(0),year:p.locator('.ir-f select').nth(1),query:p.locator('.ir-f input'),clear:p.locator('.ir-clear'),sort:p.locator('.ir-sort')}:{type:p.locator('[data-cid-filter-type]'),year:p.locator('[data-cid-filter-year]'),query:p.locator('[data-cid-filter-query]'),clear:p.locator('[data-cid-clear]'),sort:p.locator('[data-cid-sort]')};
}
async function applyScenario(p,isSource,scenario){
  await p.locator('h1').filter({hasText:'Reports & documents'}).waitFor();
  const c=controls(p,isSource);
  if(scenario==='annual')await c.type.selectOption('Annual report');
  if(scenario==='no-results')await c.query.fill('no match for local QA');
  if(scenario==='ascending')await c.sort.click();
  if(scenario==='year-search'){await c.year.selectOption('[yyyy]');await c.query.fill(' Governance ');}
}
async function interactionTrace(kind,width){
  const p=await pageFor(width,900,kind==='hosted'?{config:{logoImage:base+'/design/assets/bwci-logo.png'}}:{});
  const isSource=kind==='source';await p.goto(isSource?source:preview+kind+'.html');
  await p.locator('h1').filter({hasText:'Reports & documents'}).waitFor();
  const c=controls(p,isSource),trace=[];
  async function snapshot(name){
    await p.waitForTimeout(40);
    const count=p.locator(isSource?'.ir-count':'[data-cid-count]');
    const rows=p.locator(isSource?'.ir-tr--h':'[data-cid-document]');
    trace.push({name,count:(await count.innerText()).toLowerCase(),rows:await rows.evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>[...e.querySelectorAll('[role="cell"]')].map(c=>c.textContent.replace(/\s+/g,' ').trim()))),clear:await c.clear.isDisabled(),sort:await c.sort.isVisible()?await c.sort.getAttribute('aria-label'):null,type:await c.type.inputValue(),year:await c.year.inputValue(),query:await c.query.inputValue(),noResults:await p.locator(isSource?'.pg-empty':'[data-cid-no-results]').isVisible()});
  }
  await snapshot('initial');
  await c.sort.click();await snapshot('ascending');
  await c.type.selectOption('Annual report');await snapshot('type annual');
  await c.year.selectOption('[yyyy]');await snapshot('year plus type');
  await c.query.fill('  ANNUAL  ');await snapshot('case whitespace');
  await c.query.fill('Governance');await snapshot('combined no result');
  await c.clear.click();await snapshot('clear retains ascending');
  await c.query.fill(' policy ');await snapshot('search also matches type');
  await c.clear.click();await c.query.fill('   ');await snapshot('whitespace enables clear');
  await c.clear.click();await c.sort.click();await snapshot('descending restored');
  await p.close();return trace;
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
  const hidden = p.locator('.sr:not(.in), .cid-sr:not(.cid-in), [data-bw-rv="wait"]');
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
  const blocks = p.locator('.sr, .cid-sr');
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
    const sections = [...scope.querySelectorAll('main section')].map(el=>({
      label:el.getAttribute('data-screen-label'), y:Math.round(el.getBoundingClientRect().y - scope.getBoundingClientRect().y), height:Math.round(el.getBoundingClientRect().height)
    }));
    return {height:Math.round(scope.getBoundingClientRect().height),docW:document.documentElement.scrollWidth,sections};
  },{port,root});
}
async function check(name, fn) {
  const only=process.argv.find(arg=>arg.startsWith('--only-check='));
  if(only&&!name.includes(only.slice('--only-check='.length))&&!name.startsWith('No JavaScript/console'))return;
  try { await fn(); results.checks.push({name,status:'PASS'}); console.log('PASS '+name); }
  catch(e) { results.checks.push({name,status:'FAIL',error:e.message}); console.log('FAIL '+name+': '+e.message); }
}
async function capture(width,height=900,motion=false,scenario='default') {
  const state=scenario==='launch'?{documents:'Launch (none)'}:scenario==='flags-off'?{showFlags:false}:{};
  const suffix=(motion?'-motion':'')+(scenario==='default'?'':'-'+scenario);
  const row={width,height,motion,scenario,status:'PASS',variants:[]};
  let reference;
  for(const kind of ['source','plain','hosted']) {
    const p=await pageFor(width,height,{motion,sourceConfig:scenario==='default'?undefined:state,config:kind==='hosted'?{...state,logoImage:base+'/design/assets/bwci-logo.png'}:scenario==='default'?undefined:state});
    await p.goto(kind==='source'?source:preview+kind+'.html');
    await applyScenario(p,kind==='source',scenario);
    await settle(p);
    const g=await geometry(p,kind!=='source');
    if(g.docW>width) throw Error('Horizontal overflow '+kind+' '+width);
    if(kind==='source') reference=g;
    else assert.deepEqual(g,reference,'Section geometry '+kind+' at '+width+'x'+height);
    if(kind!=='source') {
      assert.equal(await p.locator('[data-cid-nav-list]').isVisible(),width>1100);
      assert.equal(await p.locator('[data-cid-nav-select-wrap]').isVisible(),width<=1100);
      assert.equal(await p.locator('main section').count(),2); // hero plus this Reports section
      assert.equal(await p.locator('[data-cid-asset="logoImage"]').evaluateAll(xs=>xs.every(x=>x.complete&&x.naturalWidth>0)),true);
    }
    const filename=`${kind}-${width}-${height}${suffix}.png`;
    await p.screenshot({path:path.join(out,filename),fullPage:true});
    row.variants.push({kind,...g,screenshot:filename});
    await p.close();
  }
  results.matrix.push(row);console.log('PASS matrix '+width+'x'+height+(motion?' motion':''));
}
(async()=>{
  fs.mkdirSync(out,{recursive:true});
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  // Bound concurrency; captures do not share page state.
  let jobs=widths.map(w=>[w,900,false]).concat([[390,600,false],[1024,1200,false],[1440,600,false],[390,900,true],[1440,900,true],[1440,900,false,'annual'],[390,900,false,'no-results'],[390,900,false,'launch'],[1440,900,false,'launch'],[390,900,false,'flags-off'],[1440,900,false,'ascending'],[768,900,false,'year-search']]);
  const recapture=process.argv.find(a=>a.startsWith('--recapture='));
  if(recapture)jobs=jobs.filter(j=>j.join('x')===recapture.slice('--recapture='.length));
  let next=0;
  if(!process.argv.includes('--checks-only')) {
    // Keep screenshot interaction sequential so headless background-tab observation cannot change
    // source/port reveal state. Parallel capture produced non-deterministic hidden blocks.
    while(next<jobs.length){const job=jobs[next++];await check('capture '+job.join('x'),()=>capture(...job));}
  }
  if(!process.argv.includes('--matrix-only')) {
  await check('Reports-only content, source metadata, active state and unavailable downloads',async()=>{
    const p=await pageFor();await p.goto(preview+'plain.html');
    assert.equal(await p.locator('h1').innerText(),'Reports & documents');
    assert.equal(await p.locator('[data-cid-document]').count(),5);
    assert.equal(await p.locator('[data-cid-document]:visible').count(),5);
    assert.equal(await p.locator('[data-cid-flag]:visible').count(),5);
    assert.equal(await p.locator('[data-cid-count]').innerText(),'SHOWING 1–5 OF 5 DOCUMENTS');
    assert.equal(await p.locator('[data-cid-document-link][aria-disabled="true"]').count(),5);
    await p.locator('[data-cid-document-link]').first().focus();await p.keyboard.press('Enter');assert.equal(new URL(p.url()).hash,'');
    assert.equal(await p.locator('.cid-status').innerText(),'This destination is not yet available.');
    assert.equal(await p.locator('[data-cid-nav-list] [aria-current="page"]').getAttribute('data-cid-link'),'corporateIRReportsDocuments');
    assert.equal(await p.locator('[data-cid-select]').inputValue(),'corporateIRReportsDocuments');
    assert.equal(await p.locator('x-dc,sc-if,sc-for,dc-import').count(),0);
    for(const id of ['glance','index','latest-documents','announcements','statutory','group','meetings','perimeter','notices'])assert.equal(await p.locator('#cid-'+id).count(),0);
    assert((await p.locator('main').innerText()).includes('[dd Mon yyyy]'));
    assert((await p.locator('main').innerText()).includes('PDF · [size]'));
    assert.equal(await p.locator('[data-cid-pager] button,[data-cid-pager] a').count(),0);
    await p.close();
  });
  await check('Filters/search/sort/reset match source in desktop, tablet, phone, hosted and hostile modes',async()=>{
    for(const width of [390,768,1440]){
      const expected=await interactionTrace('source',width);
      for(const kind of ['plain','hosted','hostile'])assert.deepEqual(await interactionTrace(kind,width),expected,kind+' '+width);
    }
  });
  await check('Launch mode, flags off, empty records and malformed JSON fallback',async()=>{
    for(const variant of ['plain','hosted']){
      const p=await pageFor(390,900,{config:{documents:'Launch (none)',showFlags:false}});await p.goto(preview+variant+'.html');
      assert.equal(await p.locator('[data-cid-launch-empty]').isVisible(),true);
      for(const sel of ['[data-cid-filter-type]','[data-cid-filter-year]','[data-cid-filter-query]','[data-cid-clear]'])assert.equal(await p.locator(sel).isDisabled(),true);
      for(const sel of ['[data-cid-count]','[data-cid-table]','[data-cid-pager]','[data-cid-no-results]'])assert.equal(await p.locator(sel).isVisible(),false);
      await p.close();
    }
    const p=await pageFor(1440,900,{config:{showFlags:false}});await p.goto(preview+'plain.html');assert.equal(await p.locator('[data-cid-flag]:visible').count(),0);assert((await p.locator('main').innerText()).includes('[Annual report yyyy]'));await p.close();
    const empty=await pageFor(390,900,{config:{reportDocuments:[]}});await empty.goto(preview+'plain.html');
    assert.equal(await empty.locator('[data-cid-count]').innerText(),'SHOWING 0 DOCUMENTS');
    assert.equal(await empty.locator('[data-cid-no-results]').isVisible(),true);assert.equal(await empty.locator('[data-cid-filter-query]').isEnabled(),true);await empty.close();
    const q=await pageFor();await q.route('**/preview/plain.html',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace(/("documents":) "Published"/,'$1 INVALID')});});
    await q.goto(preview+'plain.html');assert.equal(await q.locator('[data-cid-document]:visible').count(),5);await q.close();
  });
  await check('Configured records, derived years/types, safe text and verified-link navigation',async()=>{
    const records=[
      {title:'Local QA annual report',type:'Annual report',year:'2026',published:'Local QA date',file:'PDF · local QA',url:base+'/__qa__/document.pdf',unconfirmed:false},
      {title:'</script><img src=x onerror="window.__cidInjected=true">',type:'Governance',year:'2025',published:'Unconfirmed QA date',file:'PDF · local QA',url:'javascript:window.__cidInjected=true',unconfirmed:true},
      {title:'Local QA policy',type:'Policy',year:'2025',published:'Unconfirmed QA date',file:'PDF · local QA',url:'#',unconfirmed:true},
    ];
    const p=await pageFor(1440,900,{config:{reportDocuments:records}});await p.goto(preview+'plain.html');
    assert.equal(await p.locator('[data-cid-document]').count(),3);
    assert.deepEqual(await p.locator('[data-cid-filter-year] option').allTextContents(),['All years','2026','2025']);
    assert.equal(await p.locator('[data-cid-table] img').count(),0);assert.equal(await p.evaluate(()=>window.__cidInjected),undefined);
    assert.equal(await p.locator('[data-cid-document-link][aria-disabled="true"]').count(),2);
    assert.equal(await p.locator('[data-cid-flag]:visible').count(),2);
    await p.locator('[data-cid-filter-year]').selectOption('2025');assert.equal(await p.locator('[data-cid-document]:visible').count(),2);
    await p.locator('[data-cid-filter-type]').selectOption('Policy');assert.equal(await p.locator('[data-cid-document]:visible').count(),1);
    await p.locator('[data-cid-clear]').click();
    await p.locator('[data-cid-document-link]').nth(1).focus();await p.keyboard.press('Enter');assert.equal(await p.evaluate(()=>window.__cidInjected),undefined);
    await p.route('**/__qa__/document.pdf',r=>r.fulfill({contentType:'text/plain',body:'Local QA destination only; not a published document.'}));
    await p.locator('[data-cid-document-link]').first().click();await p.waitForURL(base+'/__qa__/document.pdf');await p.close();
  });
  await check('Filter listeners survive replacement and do not multiply on repeated execution',async()=>{
    const p=await pageFor(390,900);await p.goto(preview+'hostile.html');
    await p.locator('[data-cid-filter-type]').selectOption('Annual report');
    await p.evaluate(()=>{const s=[...document.querySelectorAll('script:not([type])')].pop();const copy=document.createElement('script');copy.textContent=s.textContent;document.body.appendChild(copy);});
    assert.equal(await p.locator('[data-cid-document]:visible').count(),2);
    await p.locator('[data-cid-sort]').click();assert.equal(await p.locator('[data-cid-sort-header]').getAttribute('aria-sort'),'ascending');
    await p.locator('[data-cid-menu-open]').click();
    await p.evaluate(()=>{const r=document.getElementById('bwci-corporate-ir-reports-documents');r.replaceWith(r.cloneNode(true));});await p.waitForTimeout(150);
    assert.equal(await p.locator('[data-cid-document]:visible').count(),5);
    assert.equal(await p.locator('[data-cid-sort-header]').getAttribute('aria-sort'),'descending');
    await p.locator('[data-cid-filter-query]').fill('policy');assert.equal(await p.locator('[data-cid-document]:visible').count(),1);
    await p.evaluate(()=>window.__bwciCorporateIRReportsDocuments.destroy());
    await p.locator('[data-cid-filter-query]').fill('annual');assert.equal(await p.locator('[data-cid-document]:visible').count(),1);
    await p.close();
  });
  await check('Unavailable links, keyboard focus, hover and mobile touch',async()=>{
    const p=await pageFor();await p.goto(preview+'plain.html');
    const a=p.locator('[data-cid-nav-list] [data-cid-link="corporateIRShareholders"]');
    await a.focus();await p.keyboard.press('Enter');assert.equal(new URL(p.url()).hash,'');
    assert.equal(await p.locator('.cid-status').innerText(),'This destination is not yet available.');
    assert.equal(await a.evaluate(e=>getComputedStyle(e).outlineWidth),'2px');
    await a.hover();await p.waitForTimeout(250);assert.equal(await a.evaluate(e=>getComputedStyle(e).color),'rgb(18, 48, 57)');
    await p.close();
    const q=await pageFor(390,900,{touch:true});await q.goto(preview+'plain.html');
    assert.equal(await q.locator('select option:disabled').count(),5);
    await q.locator('[data-cid-menu-open]').tap();assert.equal(await q.locator('[data-cid-drawer]').isVisible(),true);
    await q.keyboard.press('Escape');assert.equal(await q.locator('[data-cid-drawer]').isVisible(),false);await q.close();
  });
  await check('Configured independent navigation, selector, breadcrumb and Impact destination',async()=>{
    const keys=['corporateIR','corporateIRCompanyInformation','corporateIRReportsDocuments','corporateIRShareholders','corporateIRRegulatory','corporateIRLegalNotices'];
    const links=Object.fromEntries(keys.map((k,i)=>[k,base+'/__qa__/page-'+i]));
    Object.assign(links,{betterWorldImpact:base+'/__qa__/impact',home:base+'/__qa__/home'});
    const p=await pageFor(1440,900,{config:{links}});
    await p.route('**/__qa__/**',r=>r.fulfill({body:'<!doctype html><title>QA destination</title><p>Local QA only</p>',contentType:'text/html'}));
    for(const key of keys.filter(k=>k!=='corporateIRReportsDocuments')) {
      await p.goto(preview+'plain.html');
      await p.locator('[data-cid-nav-list] [data-cid-link="'+key+'"]').click();
      await p.waitForURL(links[key]);
    }
    await p.goto(preview+'plain.html');await p.setViewportSize({width:390,height:900});
    await p.locator('[data-cid-select]').selectOption('corporateIRCompanyInformation');await p.waitForURL(links.corporateIRCompanyInformation);
    await p.goto(preview+'plain.html');
    assert.equal(await p.locator('[aria-label="Breadcrumb"] [data-cid-link="home"]').getAttribute('href'),links.home);
    assert.equal(await p.locator('[aria-label="Breadcrumb"] [aria-current="page"]').innerText(),'Reports & documents');
    assert.equal(await p.locator('[aria-label="Breadcrumb"] [data-cid-link="corporateIR"]').getAttribute('href'),links.corporateIR);
    for(const key of ['betterWorldImpact'])assert.equal(await p.locator('a[data-cid-link="'+key+'"]').first().getAttribute('href'),links[key]);
    await p.close();
  });
  await check('Sticky nav, live breakpoint resize and header/footer toggles',async()=>{
    const p=await pageFor();await p.goto(preview+'plain.html');
    for(const width of [1099,1100,1101,1440,390]){
      await p.setViewportSize({width,height:600});
      assert.equal(await p.locator('[data-cid-nav-list]').isVisible(),width>1100);
    }
    await p.evaluate(()=>window.scrollTo({top:1600,behavior:'instant'}));await p.waitForTimeout(250);
    const header=await p.locator('[data-cid-hdr]').boundingBox();
    assert.equal(Math.round((await p.locator('#cid-sections').boundingBox()).y),Math.round(header.y+header.height));
    await p.close();
    const q=await pageFor(390,600,{config:{showHeader:false,showFooter:false}});await q.goto(preview+'plain.html');
    assert.equal(await q.locator('[data-cid-hdr-host],[data-cid-footer]').count(),0);
    await q.evaluate(()=>window.scrollTo({top:1600,behavior:'instant'}));
    assert.equal(Math.round((await q.locator('#cid-sections').boundingBox()).y),0);await q.close();
  });
  await check('Long content and scoped same-page anchors',async()=>{
    const p=await pageFor(390,600,{config:{links:{corporateIRRegulatory:'#cid-documents'}}});
    await p.goto(preview+'plain.html');
    const before=await p.locator(root).evaluate(e=>e.getBoundingClientRect().height);
    await p.locator('[data-cid-field="title"]').first().evaluate(e=>{e.textContent=Array(80).fill('Long document title for local layout QA.').join(' ');});
    assert((await p.locator(root).evaluate(e=>e.getBoundingClientRect().height))>before);
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await p.setViewportSize({width:1440,height:900});
    await p.locator('[data-cid-nav-list] [data-cid-link="corporateIRRegulatory"]').click();
    assert.equal(new URL(p.url()).hash,'#cid-documents');
    assert((await p.locator('#cid-documents').boundingBox()).y>=0);
    assert.equal(await p.locator('h1').innerText(),'Reports & documents');
    await p.close();
  });
  await check('Hostile host, duplicate script, root replacement and complete teardown',async()=>{
    const p=await pageFor(390,900);await p.goto(preview+'hostile.html');
    assert.equal(await p.locator('.cid-status').count(),1);
    assert.equal(await p.locator(root).evaluate(e=>getComputedStyle(e).textAlign),'left');
    assert((await p.locator('h1').evaluate(e=>getComputedStyle(e).fontFamily)).includes('Plus Jakarta Sans'));
    assert.equal(await p.locator('#cid-documents').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');
    await p.evaluate(()=>{document.body.style.overflow='auto';});
    await p.locator('[data-cid-menu-open]').click();assert.equal(await p.evaluate(()=>document.body.style.overflow),'hidden');
    await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>!!document.activeElement.closest('[data-cid-drawer]')),true);
    await p.evaluate(()=>{const el=document.getElementById('bwci-corporate-ir-reports-documents');el.replaceWith(el.cloneNode(true));});
    await p.waitForTimeout(150);
    assert.equal(await p.evaluate(()=>document.body.style.overflow),'auto');
    assert.equal(await p.locator('.cid-status').count(),1);
    await p.locator('[data-cid-menu-open]').click();await p.keyboard.press('Escape');
    assert.equal(await p.locator('[data-cid-drawer]').isVisible(),false);
    await settle(p);
    await p.screenshot({path:path.join(out,'hostile-390.png'),fullPage:true});
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert.equal(await p.locator('.ghl-above').first().evaluate(e=>getComputedStyle(e).color),'rgb(255, 255, 255)');
    await p.evaluate(()=>window.__bwciCorporateIRReportsDocuments.destroy());
    assert.equal(await p.evaluate(()=>window.__bwciCorporateIRReportsDocuments),undefined);
    assert.equal(await p.locator('.cid-status').count(),0);await p.close();
  });
  }
  await check('No JavaScript/console errors or unexpected network failures',async()=>{assert.deepEqual(errors,[]);assert.deepEqual(results.consoleErrors,[]);assert.deepEqual(results.unexpectedNetwork,[]);});
  await browser.close();
  fs.writeFileSync(path.join(out,process.argv.some(arg=>arg.startsWith('--only-check='))?'selected-checks.json':process.argv.includes('--checks-only')?'checks.json':recapture?'recapture.json':'results.json'),JSON.stringify(results,null,2)+'\n');
  if(results.checks.some(c=>c.status==='FAIL'))process.exitCode=1;
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1;});
