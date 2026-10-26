#!/usr/bin/env node
// Local browser QA. Requires Playwright and Chromium; no QA dependency is shipped in the GHL blocks.
// First run build.js and make-previews.js, then serve the repo on loopback:
// python3 -m http.server 8123 --bind 127.0.0.1
// node ghl/pages/corporate-ir/_build/qa.js http://127.0.0.1:8123
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const routeReact = require('../../governance/_build/qa-routes');
const base = (process.argv[2] || 'http://127.0.0.1:8123').replace(/\/$/, '');
const out = path.join(__dirname, 'qa-output');
const preview = base + '/ghl/pages/corporate-ir/_build/preview/';
const source = base + '/design/Corporate%20IR.dc.html';
const root = '#bwci-corporate-ir';
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
  if (opts.config) {
    await p.route('**/preview/*.html', async r => {
      const response = await r.fetch();
      const body = (await response.text()).replace(/(<script type="application\/json" id="bwci-corporate-ir-config">)([\s\S]*?)(<\/script>)/, (_,a,json,z) => {
        const cfg = JSON.parse(json);
        const value = {...cfg, ...opts.config, links:{...cfg.links, ...opts.config.links}};
        return a + JSON.stringify(value) + z;
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
  const hidden = p.locator('.sr:not(.in), .cir-sr:not(.cir-in), [data-bw-rv="wait"]');
  for (const el of await hidden.all()) {
    if (!await el.isVisible()) continue;
    await el.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
    await p.waitForTimeout(120);
  }
  await p.waitForTimeout(1300);
  // Verify the end state as well as the observer classes: a hidden ancestor may otherwise make a
  // screenshot look empty even when a child already has its own revealed class.
  const blocks = p.locator('.sr, .cir-sr');
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
  try { await fn(); results.checks.push({name,status:'PASS'}); console.log('PASS '+name); }
  catch(e) { results.checks.push({name,status:'FAIL',error:e.message}); console.log('FAIL '+name+': '+e.message); }
}
async function capture(width,height=900,motion=false) {
  const row={width,height,motion,status:'PASS',variants:[]};
  let reference;
  for(const kind of ['source','plain','hosted']) {
    const p=await pageFor(width,height,{motion,config:kind==='hosted'?{logoImage:base+'/design/assets/bwci-logo.png'}:undefined});
    await p.goto(kind==='source'?source:preview+kind+'.html');
    await settle(p);
    const g=await geometry(p,kind!=='source');
    if(g.docW>width) throw Error('Horizontal overflow '+kind+' '+width);
    if(kind==='source') reference=g;
    else assert.deepEqual(g,reference,'Section geometry '+kind+' at '+width+'x'+height);
    if(kind!=='source') {
      assert.equal(await p.locator('[data-cir-nav-list]').isVisible(),width>1100);
      assert.equal(await p.locator('[data-cir-nav-select-wrap]').isVisible(),width<=1100);
      assert.equal(await p.locator('main section').count(),7); // hero + the six overview sections
      assert.equal(await p.locator('[data-cir-asset="logoImage"]').evaluateAll(xs=>xs.every(x=>x.complete&&x.naturalWidth>0)),true);
    }
    const filename=`${kind}-${width}-${height}${motion?'-motion':''}.png`;
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
  let jobs=widths.map(w=>[w,900,false]).concat([[390,600,false],[1024,1200,false],[1440,600,false],[390,900,true],[1440,900,true]]);
  const recapture=process.argv.find(a=>a.startsWith('--recapture='));
  if(recapture)jobs=jobs.filter(j=>j.join('x')===recapture.slice('--recapture='.length));
  let next=0;
  if(!process.argv.includes('--checks-only')) {
    // Keep screenshot interaction sequential so headless background-tab observation cannot change
    // source/port reveal state. Parallel capture produced non-deterministic hidden blocks.
    while(next<jobs.length){const job=jobs[next++];await check('capture '+job.join('x'),()=>capture(...job));}
  }
  await check('Source copy and standalone overview contract',async()=>{
    const p=await pageFor();await p.goto(preview+'plain.html');
    assert.equal(await p.locator('h1').innerText(),'Corporate & Investor Relations');
    assert.equal(await p.locator('.cir-pg-kv > div').count(),6);
    assert.equal(await p.locator('.cir-gv-rows > li').count(),8);
    assert.equal(await p.locator('[data-cir-documents] [role="row"]').count(),4);
    assert.equal(await p.locator('.cir-ann > li').count(),3);
    assert.equal(await p.locator('.cir-vf ol > li').count(),3);
    assert.equal(await p.locator('.cir-pg-card').count(),2);
    assert.equal(await p.locator('x-dc,sc-if,sc-for,dc-import').count(),0);
    for(const id of ['statutory','names','group','reports','meetings','perimeter','notices'])assert.equal(await p.locator('#cir-'+id).count(),0);
    const html=await p.locator(root).innerHTML();assert(!/\.dc\.html|mailto:(?:ir|cosec|verify)@domain|tel:\+440000000000/.test(html));
    await p.close();
  });
  await check('Launch mode, showFlags false and malformed JSON fallback',async()=>{
    const p=await pageFor(390,900,{config:{documents:'Launch (none)',showFlags:false}});await p.goto(preview+'plain.html');
    assert.equal(await p.locator('[data-cir-documents]').isVisible(),false);
    assert.equal(await p.locator('[data-cir-no-documents]').isVisible(),true);
    assert.equal(await p.locator('[data-cir-flag]:visible').count(),0);
    assert((await p.locator('main').innerText()).includes('[000000]')); // hiding badges never confirms facts
    await p.close();
    const q=await pageFor();await q.route('**/preview/plain.html',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace(/("showFlags":) true/,'$1 INVALID')});});
    await q.goto(preview+'plain.html');assert.equal(await q.locator('[data-cir-documents]').isVisible(),true);await q.close();
  });
  await check('Unavailable links, keyboard focus, hover and mobile touch',async()=>{
    const p=await pageFor();await p.goto(preview+'plain.html');
    const a=p.locator('[data-cir-nav-list] [data-cir-link="corporateIRCompanyInformation"]');
    await a.focus();await p.keyboard.press('Enter');assert.equal(new URL(p.url()).hash,'');
    assert.equal(await p.locator('.cir-status').innerText(),'This destination is not yet available.');
    assert.equal(await a.evaluate(e=>getComputedStyle(e).outlineWidth),'2px');
    await a.hover();await p.waitForTimeout(250);assert.equal(await a.evaluate(e=>getComputedStyle(e).color),'rgb(18, 48, 57)');
    await p.close();
    const q=await pageFor(390,900,{touch:true});await q.goto(preview+'plain.html');
    assert.equal(await q.locator('select option:disabled').count(),5);
    await q.locator('[data-cir-menu-open]').tap();assert.equal(await q.locator('[data-cir-drawer]').isVisible(),true);
    await q.keyboard.press('Escape');assert.equal(await q.locator('[data-cir-drawer]').isVisible(),false);await q.close();
  });
  await check('Configured independent page navigation, selector, breadcrumbs and contacts',async()=>{
    const keys=['corporateIR','corporateIRCompanyInformation','corporateIRReportsDocuments','corporateIRShareholders','corporateIRRegulatory','corporateIRLegalNotices'];
    const links=Object.fromEntries(keys.map((k,i)=>[k,base+'/__qa__/page-'+i]));
    Object.assign(links,{betterWorldImpact:base+'/__qa__/impact',announcements:base+'/__qa__/announcements',verifyPhone:'tel:+442079460000',verifyEmail:'mailto:qa@example.test',irEmail:'mailto:ir@example.test',secretaryEmail:'mailto:secretary@example.test',home:base+'/__qa__/home'});
    const p=await pageFor(1440,900,{config:{links}});
    await p.route('**/__qa__/**',r=>r.fulfill({body:'<!doctype html><title>QA destination</title><p>Local QA only</p>',contentType:'text/html'}));
    for(const key of keys.slice(1)) {
      await p.goto(preview+'plain.html');
      await p.locator('[data-cir-nav-list] [data-cir-link="'+key+'"]').click();
      await p.waitForURL(links[key]);
    }
    await p.goto(preview+'plain.html');await p.setViewportSize({width:390,height:900});
    await p.locator('[data-cir-select]').selectOption('corporateIRReportsDocuments');await p.waitForURL(links.corporateIRReportsDocuments);
    await p.goto(preview+'plain.html');
    assert.equal(await p.locator('[aria-label="Breadcrumb"] [data-cir-link="home"]').getAttribute('href'),links.home);
    assert.equal(await p.locator('[aria-label="Breadcrumb"] [aria-current="page"]').innerText(),'Corporate/IR');
    for(const key of ['verifyPhone','verifyEmail','irEmail','secretaryEmail','announcements','betterWorldImpact'])assert.equal(await p.locator('a[data-cir-link="'+key+'"]').first().getAttribute('href'),links[key]);
    await p.close();
  });
  await check('Sticky nav, live breakpoint resize and header/footer toggles',async()=>{
    const p=await pageFor();await p.goto(preview+'plain.html');
    for(const width of [1099,1100,1101,1440,390]){
      await p.setViewportSize({width,height:600});
      assert.equal(await p.locator('[data-cir-nav-list]').isVisible(),width>1100);
    }
    await p.evaluate(()=>window.scrollTo({top:1600,behavior:'instant'}));await p.waitForTimeout(250);
    const header=await p.locator('[data-cir-hdr]').boundingBox();
    assert.equal(Math.round((await p.locator('#cir-sections').boundingBox()).y),Math.round(header.y+header.height));
    await p.close();
    const q=await pageFor(390,600,{config:{showHeader:false,showFooter:false}});await q.goto(preview+'plain.html');
    assert.equal(await q.locator('[data-cir-hdr-host],[data-cir-footer]').count(),0);
    await q.evaluate(()=>window.scrollTo({top:1600,behavior:'instant'}));
    assert.equal(Math.round((await q.locator('#cir-sections').boundingBox()).y),0);await q.close();
  });
  await check('Long content and scoped same-page anchors',async()=>{
    const p=await pageFor(390,600,{config:{links:{corporateIRCompanyInformation:'#cir-contact'}}});
    await p.goto(preview+'plain.html');
    const before=await p.locator(root).evaluate(e=>e.getBoundingClientRect().height);
    await p.locator('.cir-pg-kv dd').first().evaluate(e=>{e.textContent=Array(80).fill('Long company information for local layout QA.').join(' ');});
    assert((await p.locator(root).evaluate(e=>e.getBoundingClientRect().height))>before);
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await p.locator('.cir-more [data-cir-link="corporateIRCompanyInformation"]').click();
    assert.equal(new URL(p.url()).hash,'#cir-contact');
    assert((await p.locator('#cir-contact').boundingBox()).y>=0);
    assert.equal(await p.locator('h1').innerText(),'Corporate & Investor Relations');
    await p.close();
  });
  await check('Hostile host, duplicate script, root replacement and complete teardown',async()=>{
    const p=await pageFor(390,900);await p.goto(preview+'hostile.html');
    assert.equal(await p.locator('.cir-status').count(),1);
    assert.equal(await p.locator(root).evaluate(e=>getComputedStyle(e).textAlign),'left');
    assert((await p.locator('h1').evaluate(e=>getComputedStyle(e).fontFamily)).includes('Plus Jakarta Sans'));
    assert.equal(await p.locator('#cir-glance').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');
    await p.evaluate(()=>{document.body.style.overflow='auto';});
    await p.locator('[data-cir-menu-open]').click();assert.equal(await p.evaluate(()=>document.body.style.overflow),'hidden');
    await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>!!document.activeElement.closest('[data-cir-drawer]')),true);
    await p.evaluate(()=>{const el=document.getElementById('bwci-corporate-ir');el.replaceWith(el.cloneNode(true));});
    await p.waitForTimeout(150);
    assert.equal(await p.evaluate(()=>document.body.style.overflow),'auto');
    assert.equal(await p.locator('.cir-status').count(),1);
    await p.locator('[data-cir-menu-open]').click();await p.keyboard.press('Escape');
    assert.equal(await p.locator('[data-cir-drawer]').isVisible(),false);
    await settle(p);
    await p.screenshot({path:path.join(out,'hostile-390.png'),fullPage:true});
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert.equal(await p.locator('.ghl-above').first().evaluate(e=>getComputedStyle(e).color),'rgb(255, 255, 255)');
    await p.evaluate(()=>window.__bwciCorporateIR.destroy());
    assert.equal(await p.evaluate(()=>window.__bwciCorporateIR),undefined);
    assert.equal(await p.locator('.cir-status').count(),0);await p.close();
  });
  await check('No JavaScript/console errors or unexpected network failures',async()=>{assert.deepEqual(errors,[]);assert.deepEqual(results.consoleErrors,[]);assert.deepEqual(results.unexpectedNetwork,[]);});
  await browser.close();
  fs.writeFileSync(path.join(out,process.argv.includes('--checks-only')?'checks.json':recapture?'recapture.json':'results.json'),JSON.stringify(results,null,2)+'\n');
  if(results.checks.some(c=>c.status==='FAIL'))process.exitCode=1;
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1;});
