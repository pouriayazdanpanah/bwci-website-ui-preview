#!/usr/bin/env node
// Local browser QA. Requires Playwright and Chromium; no QA dependency is shipped in the GHL blocks.
// First run build.js and make-previews.js, then serve the repo on loopback:
// python3 -m http.server 8123 --bind 127.0.0.1
// node ghl/pages/corporate-ir-shareholders/_build/qa.js http://127.0.0.1:8123
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const routeReact = require('../../governance/_build/qa-routes');
const base = (process.argv[2] || 'http://127.0.0.1:8123').replace(/\/$/, '');
const out = path.join(__dirname, 'qa-output');
const preview = base + '/ghl/pages/corporate-ir-shareholders/_build/preview/';
const source = base + '/design/Corporate%20IR.dc.html#shareholders';
const root = '#bwci-corporate-ir-shareholders';
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
        for(const key of ['showFlags'])if(Object.hasOwn(opts.sourceConfig,key))props[key].default=opts.sourceConfig[key];
        return 'data-props="'+JSON.stringify(props).replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'"';
      });
      await r.fulfill({response,body});
    });
  }
  if (opts.config) {
    await p.route('**/preview/*.html', async r => {
      const response = await r.fetch();
      const body = (await response.text()).replace(/(<script type="application\/json" id="bwci-corporate-ir-shareholders-config">)([\s\S]*?)(<\/script>)/, (_,a,json,z) => {
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
  const hidden = p.locator('.sr:not(.in), .cis-sr:not(.cis-in), [data-bw-rv="wait"]');
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
  const blocks = p.locator('.sr, .cis-sr');
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
async function capture(width,height=900,motion=false,scenario='default') {
  const state=scenario==='flags-off'?{showFlags:false}:{};
  const suffix=(motion?'-motion':'')+(scenario==='default'?'':'-'+scenario);
  const row={width,height,motion,scenario,status:'PASS',variants:[]};
  let reference;
  for(const kind of ['source','plain','hosted']) {
    const p=await pageFor(width,height,{motion,sourceConfig:scenario==='default'?undefined:state,config:kind==='hosted'?{...state,logoImage:base+'/design/assets/bwci-logo.png'}:scenario==='default'?undefined:state});
    await p.goto(kind==='source'?source:preview+kind+'.html');
    await settle(p);
    const g=await geometry(p,kind!=='source');
    if(g.docW>width) throw Error('Horizontal overflow '+kind+' '+width);
    if(kind==='source') reference=g;
    else assert.deepEqual(g,reference,'Section geometry '+kind+' at '+width+'x'+height);
    if(kind!=='source') {
      assert.equal(await p.locator('[data-cis-nav-list]').isVisible(),width>1100);
      assert.equal(await p.locator('[data-cis-nav-select-wrap]').isVisible(),width<=1100);
      assert.equal(await p.locator('main section').count(),4); // hero plus the three Shareholders sections
      assert.equal(await p.locator('[data-cis-asset="logoImage"]').evaluateAll(xs=>xs.every(x=>x.complete&&x.naturalWidth>0)),true);
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
  let jobs=widths.map(w=>[w,900,false]).concat([[390,600,false],[1024,1200,false],[1440,600,false],[390,900,true],[1440,900,true],[390,900,false,'flags-off'],[1440,900,false,'flags-off']]);
  const recapture=process.argv.find(a=>a.startsWith('--recapture='));
  if(recapture)jobs=jobs.filter(j=>j.join('x')===recapture.slice('--recapture='.length));
  let next=0;
  if(!process.argv.includes('--checks-only')) {
    // Keep screenshot interaction sequential so headless background-tab observation cannot change
    // source/port reveal state. Parallel capture produced non-deterministic hidden blocks.
    while(next<jobs.length){const job=jobs[next++];await check('capture '+job.join('x'),()=>capture(...job));}
  }
  if(!process.argv.includes('--matrix-only')) {
  await check('Shareholders-only content, original facts/meetings/contact and unavailable destinations',async()=>{
    const p=await pageFor();await p.goto(preview+'plain.html');
    assert.equal(await p.locator('h1').innerText(),'Shareholder information');
    assert.equal(await p.locator('.cis-pg-kv > div').count(),4);
    assert.equal(await p.locator('[aria-label="General meetings"] [role="row"]').count(),3);
    assert.equal(await p.locator('.cis-pg-card').count(),1);
    assert.equal(await p.locator('[data-cis-nav-list] [aria-current="page"]').getAttribute('data-cis-link'),'corporateIRShareholders');
    assert.equal(await p.locator('[data-cis-select]').inputValue(),'corporateIRShareholders');
    assert.equal(await p.locator('[data-cis-flag]:visible').count(),6);
    assert.equal(await p.locator('x-dc,sc-if,sc-for,dc-import').count(),0);
    for(const id of ['glance','index','latest-documents','announcements','documents','statutory','names','group','perimeter','notices'])assert.equal(await p.locator('#cis-'+id).count(),0);
    const content=await p.locator('main').innerText();
    for(const text of ['[Ordinary shares of £[x] each]','[No]','[cosec@domain]','Annual general meeting [yyyy]','[dd Mon yyyy]','[Name], [Role]','[ir@domain]','[Postal address]'])assert(content.includes(text),text);
    assert.equal(await p.locator('a[href="mailto:ir@domain"],a[href="mailto:cosec@domain"]').count(),0);
    for(const key of ['shareholderMeetingNotice','shareholderMeetingResults','irEmail']){
      const link=p.locator('a[data-cis-link="'+key+'"]');
      assert.equal(await link.getAttribute('href'),'#');assert.equal(await link.getAttribute('aria-disabled'),'true');
      await link.focus();await p.keyboard.press('Enter');assert.equal(new URL(p.url()).hash,'');
      assert.equal(await p.locator('.cis-status').innerText(),'This destination is not yet available.');
    }
    await p.close();
  });
  await check('Flags off preserves all placeholders; malformed JSON is safe',async()=>{
    for(const variant of ['plain','hosted']){
      const p=await pageFor(390,900,{config:{showFlags:false}});await p.goto(preview+variant+'.html');
      assert.equal(await p.locator('[data-cis-flag]:visible').count(),0);
      assert((await p.locator('main').innerText()).includes('[Registrar name or "Company secretary"]'));
      assert.equal(await p.locator('[aria-label="General meetings"] [role="row"]').count(),3);await p.close();
    }
    const q=await pageFor();await q.route('**/preview/plain.html',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace(/("showFlags":) true/,'$1 INVALID')});});
    await q.goto(preview+'plain.html');assert.equal(await q.locator('[data-cis-flag]:visible').count(),6);await q.close();
  });
  await check('Distinct configured meeting URLs, approved email and copied-root route updates',async()=>{
    const notice=base+'/__qa__/meeting-notice.pdf',resultsUrl=base+'/__qa__/meeting-results.pdf';
    const p=await pageFor(1440,900,{config:{links:{shareholderMeetingNotice:notice,shareholderMeetingResults:resultsUrl,irEmail:'mailto:ir@example.test'},footer:{regulatoryLine:'Local QA footer wording'}}});
    await p.route('**/__qa__/**',r=>r.fulfill({contentType:'text/plain',body:'Local QA destination only, not a published document.'}));
    for(const [key,url]of [['shareholderMeetingNotice',notice],['shareholderMeetingResults',resultsUrl]]){
      await p.goto(preview+'plain.html');await p.locator('a[data-cis-link="'+key+'"]').click();await p.waitForURL(url);
    }
    await p.goto(preview+'plain.html');
    assert.equal(await p.locator('a[data-cis-link="irEmail"]').getAttribute('href'),'mailto:ir@example.test');
    assert.equal(await p.locator('.cis-sft__reg').count(),1);
    await p.evaluate(()=>{const el=document.getElementById('bwci-corporate-ir-shareholders');el.replaceWith(el.cloneNode(true));});await p.waitForTimeout(150);
    assert.equal(await p.locator('.cis-sft__reg').count(),1);
    assert.equal(await p.locator('a[data-cis-link="irEmail"]').getAttribute('aria-disabled'),null);
    await p.close();
    const q=await pageFor();await q.goto(preview+'plain.html');
    await q.evaluate(url=>{const cfg=document.getElementById('bwci-corporate-ir-shareholders-config');const v=JSON.parse(cfg.textContent);v.links.shareholderMeetingNotice=url;v.links.irEmail='mailto:ir@example.test';cfg.textContent=JSON.stringify(v);const el=document.getElementById('bwci-corporate-ir-shareholders');el.replaceWith(el.cloneNode(true));},notice);await q.waitForTimeout(150);
    assert.equal(await q.locator('a[data-cis-link="shareholderMeetingNotice"]').getAttribute('href'),notice);
    assert.equal(await q.locator('a[data-cis-link="shareholderMeetingNotice"]').getAttribute('aria-disabled'),null);
    assert.equal(await q.locator('a[data-cis-link="irEmail"]').getAttribute('aria-disabled'),null);await q.close();
  });
  await check('Unavailable links, keyboard focus, hover and mobile touch',async()=>{
    const p=await pageFor();await p.goto(preview+'plain.html');
    const a=p.locator('[data-cis-nav-list] [data-cis-link="corporateIRRegulatory"]');
    await a.focus();await p.keyboard.press('Enter');assert.equal(new URL(p.url()).hash,'');
    assert.equal(await p.locator('.cis-status').innerText(),'This destination is not yet available.');
    assert.equal(await a.evaluate(e=>getComputedStyle(e).outlineWidth),'2px');
    await a.hover();await p.waitForTimeout(250);assert.equal(await a.evaluate(e=>getComputedStyle(e).color),'rgb(18, 48, 57)');
    await p.close();
    const q=await pageFor(390,900,{touch:true});await q.goto(preview+'plain.html');
    assert.equal(await q.locator('select option:disabled').count(),5);
    await q.locator('[data-cis-menu-open]').tap();assert.equal(await q.locator('[data-cis-drawer]').isVisible(),true);
    await q.keyboard.press('Escape');assert.equal(await q.locator('[data-cis-drawer]').isVisible(),false);await q.close();
  });
  await check('Configured independent navigation, selector, breadcrumb and Impact destination',async()=>{
    const keys=['corporateIR','corporateIRCompanyInformation','corporateIRReportsDocuments','corporateIRShareholders','corporateIRRegulatory','corporateIRLegalNotices'];
    const links=Object.fromEntries(keys.map((k,i)=>[k,base+'/__qa__/page-'+i]));
    Object.assign(links,{betterWorldImpact:base+'/__qa__/impact',home:base+'/__qa__/home'});
    const p=await pageFor(1440,900,{config:{links}});
    await p.route('**/__qa__/**',r=>r.fulfill({body:'<!doctype html><title>QA destination</title><p>Local QA only</p>',contentType:'text/html'}));
    for(const key of keys.filter(k=>k!=='corporateIRShareholders')) {
      await p.goto(preview+'plain.html');
      await p.locator('[data-cis-nav-list] [data-cis-link="'+key+'"]').click();
      await p.waitForURL(links[key]);
    }
    await p.goto(preview+'plain.html');await p.setViewportSize({width:390,height:900});
    await p.locator('[data-cis-select]').selectOption('corporateIRReportsDocuments');await p.waitForURL(links.corporateIRReportsDocuments);
    await p.goto(preview+'plain.html');
    assert.equal(await p.locator('[aria-label="Breadcrumb"] [data-cis-link="home"]').getAttribute('href'),links.home);
    assert.equal(await p.locator('[aria-label="Breadcrumb"] [aria-current="page"]').innerText(),'Shareholder information');
    assert.equal(await p.locator('[aria-label="Breadcrumb"] [data-cis-link="corporateIR"]').getAttribute('href'),links.corporateIR);
    for(const key of ['betterWorldImpact'])assert.equal(await p.locator('a[data-cis-link="'+key+'"]').first().getAttribute('href'),links[key]);
    await p.close();
  });
  await check('Sticky nav, live breakpoint resize and header/footer toggles',async()=>{
    const p=await pageFor();await p.goto(preview+'plain.html');
    for(const width of [1099,1100,1101,1440,390]){
      await p.setViewportSize({width,height:600});
      assert.equal(await p.locator('[data-cis-nav-list]').isVisible(),width>1100);
    }
    await p.evaluate(()=>window.scrollTo({top:1600,behavior:'instant'}));await p.waitForTimeout(250);
    const header=await p.locator('[data-cis-hdr]').boundingBox();
    assert.equal(Math.round((await p.locator('#cis-sections').boundingBox()).y),Math.round(header.y+header.height));
    await p.close();
    const q=await pageFor(390,600,{config:{showHeader:false,showFooter:false}});await q.goto(preview+'plain.html');
    assert.equal(await q.locator('[data-cis-hdr-host],[data-cis-footer]').count(),0);
    await q.evaluate(()=>window.scrollTo({top:1600,behavior:'instant'}));
    assert.equal(Math.round((await q.locator('#cis-sections').boundingBox()).y),0);await q.close();
  });
  await check('Long content and scoped same-page anchors',async()=>{
    const p=await pageFor(390,600,{config:{links:{corporateIRRegulatory:'#cis-meetings'}}});
    await p.goto(preview+'plain.html');
    const before=await p.locator(root).evaluate(e=>e.getBoundingClientRect().height);
    await p.locator('.cis-pg-kv dd').first().evaluate(e=>{e.textContent=Array(80).fill('Long shareholder information for local layout QA.').join(' ');});
    assert((await p.locator(root).evaluate(e=>e.getBoundingClientRect().height))>before);
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await p.setViewportSize({width:1440,height:900});
    await p.locator('[data-cis-nav-list] [data-cis-link="corporateIRRegulatory"]').click();
    assert.equal(new URL(p.url()).hash,'#cis-meetings');
    assert((await p.locator('#cis-meetings').boundingBox()).y>=0);
    assert.equal(await p.locator('h1').innerText(),'Shareholder information');
    await p.close();
  });
  await check('Hostile host, duplicate script, root replacement and complete teardown',async()=>{
    const p=await pageFor(390,900);await p.goto(preview+'hostile.html');
    assert.equal(await p.locator('.cis-status').count(),1);
    assert.equal(await p.locator(root).evaluate(e=>getComputedStyle(e).textAlign),'left');
    assert((await p.locator('h1').evaluate(e=>getComputedStyle(e).fontFamily)).includes('Plus Jakarta Sans'));
    assert.equal(await p.locator('#cis-share-status').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');
    await p.evaluate(()=>{document.body.style.overflow='auto';});
    await p.locator('[data-cis-menu-open]').click();assert.equal(await p.evaluate(()=>document.body.style.overflow),'hidden');
    await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>!!document.activeElement.closest('[data-cis-drawer]')),true);
    await p.evaluate(()=>{const el=document.getElementById('bwci-corporate-ir-shareholders');el.replaceWith(el.cloneNode(true));});
    await p.waitForTimeout(150);
    assert.equal(await p.evaluate(()=>document.body.style.overflow),'auto');
    assert.equal(await p.locator('.cis-status').count(),1);
    await p.locator('[data-cis-menu-open]').click();await p.keyboard.press('Escape');
    assert.equal(await p.locator('[data-cis-drawer]').isVisible(),false);
    await settle(p);
    await p.screenshot({path:path.join(out,'hostile-390.png'),fullPage:true});
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert.equal(await p.locator('.ghl-above').first().evaluate(e=>getComputedStyle(e).color),'rgb(255, 255, 255)');
    await p.evaluate(()=>window.__bwciCorporateIRShareholders.destroy());
    assert.equal(await p.evaluate(()=>window.__bwciCorporateIRShareholders),undefined);
    assert.equal(await p.locator('.cis-status').count(),0);await p.close();
  });
  }
  await check('No JavaScript/console errors or unexpected network failures',async()=>{assert.deepEqual(errors,[]);assert.deepEqual(results.consoleErrors,[]);assert.deepEqual(results.unexpectedNetwork,[]);});
  await browser.close();
  fs.writeFileSync(path.join(out,process.argv.includes('--checks-only')?'checks.json':recapture?'recapture.json':'results.json'),JSON.stringify(results,null,2)+'\n');
  if(results.checks.some(c=>c.status==='FAIL'))process.exitCode=1;
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1;});
