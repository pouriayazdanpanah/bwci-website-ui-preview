// Dev-only acceptance QA for behavior that depends on GHL hosting and configured routes.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const base=(process.argv[2]||'http://127.0.0.1:8765/').replace(/\/?$/,'/');
const slug='profile-christie-osarenren', rootId='bwci-'+slug;
const dir=path.resolve(__dirname,'..'), inline=fs.readFileSync(path.join(dir,slug+'.inline.ghl.html'),'utf8');
const configRe=/(<script type="application\/json" id="bwci-profile-christie-osarenren-config">)([\s\S]*?)(<\/script>)/;
const runtime=inline.slice(inline.lastIndexOf('<script>')+8,inline.lastIndexOf('</script>'));
const template=fs.readFileSync(path.join(__dirname,'preview/hostile.html'),'utf8');
function configure(block){return block.replace(configRe,(m,a,j,c)=>{const cfg=JSON.parse(j);Object.assign(cfg.links,{governance:base+'qa-target/governance',governanceBoard:base+'qa-target/board',leadership:base+'qa-target/leadership',profileAlexanderAlegriaSaif:base+'qa-target/alex?lang=en#bio',profileFarhadReyazat:base+'qa-target/farhad#bio',profileGabriellaKarlova:base+'qa-target/gabriella#bio'});return a+JSON.stringify(cfg)+c;});}
(async()=>{
 const browser=await chromium.launch({channel:process.env.BWCI_QA_CHANNEL||'chrome'}),errors=[],failures=[],results={};
 async function open(width=1440,from='',hostile=false){
  const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))failures.push(r.status()+' '+r.url());});
  page.on('requestfailed',r=>failures.push(r.url()+': '+r.failure().errorText));
  const html=hostile?configure(template):'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0}</style>'+configure(inline);
  await page.route(base+'qa-profile.html*',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}));
  await page.route(base+'qa-target/**',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:'<!doctype html><h1>QA destination</h1>'}));
  await page.goto(base+'qa-profile.html'+from,{waitUntil:'networkidle'});await page.waitForTimeout(600);return page;
 }
 for(const from of ['','?from=board','?from=leadership','?from=bogus']){
  const p=await open(1440,from);
  const actual=await p.locator('nav[aria-label="Breadcrumb"] a').last().getAttribute('href');
  assert.equal(actual,base+'qa-target/'+(from==='?from=board'?'board':'leadership'));
  const cards=await p.locator('a.gv-card').evaluateAll(es=>es.map(e=>e.href));
  assert.deepEqual(cards,[base+'qa-target/alex?lang=en&from=board#bio',base+'qa-target/farhad?from=board#bio',base+'qa-target/gabriella?from=board#bio']);
  results['routes '+(from||'direct')]='PASS';await p.close();
 }
 {
  const p=await open(390,'?from=leadership');
  await p.locator('[data-pco-gn-select]').selectOption({label:'Board of Directors'});
  await p.waitForURL(base+'qa-target/board');results.mobileSelectNavigation='PASS';await p.close();
 }
 for(const keyboard of [false,true]){
  const p=await open();const card=p.locator('a.gv-card').first();await card.scrollIntoViewIfNeeded();
  if(keyboard){await card.focus();await p.keyboard.press('Enter');}else{await card.click();}
  await p.waitForURL(base+'qa-target/alex?lang=en&from=board#bio');results[keyboard?'keyboardNavigation':'clickNavigation']='PASS';await p.close();
 }
 {
  const p=await open(390);const list=p.locator('.pco-gv-also');await list.scrollIntoViewIfNeeded();await p.waitForTimeout(700);
  const b=await list.boundingBox(),y=b.y+60;
  await p.mouse.move(280,y);await p.mouse.down();await p.mouse.move(90,y,{steps:12});await p.mouse.up();await p.waitForTimeout(300);
  assert(p.url().includes('qa-profile.html'));assert(await list.evaluate(e=>e.scrollLeft)>30);
  assert.equal(await list.evaluate(e=>e.classList.contains('pco-is-drag')),false);
  await list.evaluate(e=>{e.scrollLeft=0});await p.waitForTimeout(400);await p.locator('a.gv-card').first().click();
  await p.waitForURL(base+'qa-target/alex?lang=en&from=board#bio');results.dragClickSuppressionAndNextClick='PASS';await p.close();
 }
 for(const width of [390,1440]){
  const p=await open(width,'?from=leadership',true);
  await p.evaluate(()=>{window.__firstProfile=window.__bwciProfileChristieOsarenren;});
  await p.evaluate(runtime);assert(await p.evaluate(()=>window.__firstProfile===window.__bwciProfileChristieOsarenren));
  if(width===390){await p.locator('[data-pco-menu-open]').click();assert.equal(await p.evaluate(()=>document.body.style.overflow),'hidden');}
  await p.evaluate(()=>{const old=document.getElementById('bwci-profile-christie-osarenren');old.replaceWith(old.cloneNode(true));});
  await p.waitForFunction(()=>window.__firstProfile.destroyed&&window.__bwciProfileChristieOsarenren!==window.__firstProfile&&window.__bwciProfileChristieOsarenren.root===document.getElementById('bwci-profile-christie-osarenren'));
  assert.notEqual(await p.evaluate(()=>document.body.style.overflow),'hidden');
  assert.equal(await p.locator('nav[aria-label="Governance sections"] a[aria-current]').textContent(),'Leadership');
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await p.setViewportSize({width:width===390?1440:390,height:600});await p.waitForTimeout(200);
  assert(await p.locator('[data-pco-gn-select]').isVisible() === (width!==390));
  await p.evaluate(()=>{window.__lastProfile=window.__bwciProfileChristieOsarenren;document.getElementById('bwci-profile-christie-osarenren').remove();});
  await p.waitForFunction(()=>window.__lastProfile.destroyed&&!window.__bwciProfileChristieOsarenren);
  assert.equal(await p.locator('.ghl-above').count(),2);results['hostile lifecycle '+width]='PASS';await p.close();
 }
 {
  const p=await browser.newPage();await p.goto(base+'ghl/pages/profile-christie-osarenren/_build/preview/plain.html',{waitUntil:'networkidle'});
  await p.evaluate(()=>{document.getElementById('bwci-profile-christie-osarenren').remove();});
  await p.waitForFunction(()=>!window.__bwciProfileChristieOsarenren);
  await p.evaluate(runtime);
  assert(await p.evaluate(()=>!!window.__bwciProfileChristieOsarenrenPending));
  await p.evaluate(runtime);
  await p.evaluate(block=>{document.body.innerHTML=block;},inline);
  await p.waitForFunction(()=>window.__bwciProfileChristieOsarenren&&!window.__bwciProfileChristieOsarenrenPending);
  results.deferredMarkupAndRepeatedBootstrap='PASS';await p.close();
 }
 const p=await open();results.fonts=await p.evaluate(()=>[...document.fonts].map(f=>({family:f.family,status:f.status})).filter(f=>f.status==='loaded'));await p.close();
 assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);results.errors=errors;results.networkFailures=failures;
 console.log(JSON.stringify(results,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
