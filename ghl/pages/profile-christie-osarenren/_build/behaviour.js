// Dev-only source/port interaction comparison. Run with a served URL and optional label.
// NODE_PATH=<Playwright module directory> node behaviour.js <url> [label]
const {chromium} = require('playwright');
const routeReact = require('./qa-routes');
const ready = require('./qa-ready');
const assert = require('assert/strict');
const url = process.argv[2], label = process.argv[3] || url;
const SEL = {hero:'#top, #pco-top', bio:'#biography, #pco-biography', related:'#related, #pco-related', list:'.gv-also, .pco-gv-also'};
(async()=>{
 const browser=await chromium.launch({channel:process.env.BWCI_QA_CHANNEL||'chrome'});
 const errors=[], out={};
 async function open(opts={},query=''){
  const page=await browser.newPage({viewport:{width:1440,height:900},...opts});
  page.on('pageerror',e=>errors.push(String(e))); await routeReact(page);
  await ready(page,url+query);await page.waitForFunction(expected=>{const n=document.querySelector('nav[aria-label="Governance sections"]');if(!n)return false;const c=n.querySelector('a[aria-current]')||(n.querySelector('select')&&n.querySelector('select').selectedOptions[0]);return c&&c.textContent.trim()===expected;},query==='?from=board'?'Board of Directors':query==='?from=leadership'?'Leadership':'Leadership');await page.waitForTimeout(1800);return page;
 }
 const state=page=>page.evaluate(S=>{
  const clean=e=>e.textContent.replace(/\s+/g,' ').trim();
  const hero=document.querySelector(S.hero), bio=document.querySelector(S.bio), rel=document.querySelector(S.related);
  return {name:clean(hero.querySelector('h1')),crumb:[...hero.querySelectorAll('nav li')].map(clean),
   current:clean(document.querySelector('nav[aria-label="Governance sections"] a[aria-current]')||document.querySelector('nav[aria-label="Governance sections"] select').selectedOptions[0]),
   selected:(document.querySelector('nav[aria-label="Governance sections"] select')||{}).selectedIndex ?? [...document.querySelectorAll('nav[aria-label="Governance sections"] ul a')].findIndex(a=>a.hasAttribute('aria-current')),
   paragraphs:[...bio.querySelectorAll('.pg-body p, .pco-pg-body p')].map(clean),
   roles:[...hero.querySelectorAll('.lead, .pco-lead')].map(clean),labels:[...hero.querySelectorAll('ul li')].map(clean),
   fields:[...bio.querySelectorAll('dl>div')].map(e=>[clean(e.querySelector('dt')),clean(e.querySelector('dd'))]),
   related:[...rel.querySelectorAll('a.gv-card')].map(a=>a.getAttribute('aria-label')),
   back:[...rel.querySelectorAll('a.link, a.pco-link')].map(clean),
   images:[...document.querySelectorAll('image-slot, .pco-slot')].map(el=>{
    const img=el.shadowRoot?el.shadowRoot.querySelector('img'):el.querySelector('img');
    const b=img.getBoundingClientRect(), f=el.getBoundingClientRect();
    return [img.complete,img.naturalWidth,Math.round(b.width),Math.round(b.height),Math.round(f.width),Math.round(f.height)];})};
 },SEL);
 for(const query of ['', '?from=board','?from=leadership','?from=invalid']){
  const p=await open({},query), s=await state(p);
  assert.equal(s.name,'Christie Osarenren');assert.equal(s.paragraphs.length,0);
  assert.deepEqual(s.roles,["Senior Market Strategy & Research Analyst"]);assert.deepEqual(s.labels,["Leadership"]);
  assert.equal(s.fields.length,4);assert(s.fields.every(f=>f[1]===''));
  assert.equal(s.related.length,3);assert(!s.related.some(n=>n.includes('Christie Osarenren')));
  assert.equal(s.current,query==='?from=board'?'Board of Directors':query==='?from=leadership'?'Leadership':"Leadership");
  assert.equal(s.crumb[2],s.current);assert(s.images.every(i=>i[0]&&i[1]>0));
  out['context '+(query||'direct')]=s;await p.close();
 }
 {
  const p=await open();const card=p.locator('a.gv-card').first();await card.scrollIntoViewIfNeeded();
  const cardState=()=>card.evaluate(a=>{const s=getComputedStyle(a),slot=a.querySelector('image-slot, .pco-slot'),ov=getComputedStyle(a.querySelector('.gv-card-ov'));return [s.transform,s.borderTopColor,getComputedStyle(slot).transform,ov.opacity,s.outlineStyle,s.outlineWidth];});
  await card.hover();await p.waitForTimeout(800);out.hover=await cardState();assert.equal(out.hover[3],'1');
  await p.mouse.move(1,1);await p.waitForTimeout(700);await card.focus();await p.keyboard.press('Shift+Tab');await p.keyboard.press('Tab');
  out.keyboard=await cardState();assert.equal(out.keyboard[4],'solid');
  const gn=p.locator('nav[aria-label="Governance sections"]');await gn.scrollIntoViewIfNeeded();await p.evaluate(()=>scrollBy(0,250));await p.waitForTimeout(400);
  out.sticky=await gn.evaluate(n=>Math.round(n.getBoundingClientRect().top));assert(out.sticky>=0&&out.sticky<120);
  for(const width of [700,1100,320,1600]){await p.setViewportSize({width,height:600});await p.waitForTimeout(200);const s=await state(p);assert(s.images.every(i=>i[0]&&i[1]>0));}
  out.resize='PASS';await p.close();
 }
 {
  const p=await open({viewport:{width:390,height:844}});const list=p.locator(SEL.list);await list.scrollIntoViewIfNeeded();await p.waitForTimeout(1600);
  const b=await list.boundingBox(), y=b.y+Math.min(80,b.height/2);
  await p.mouse.move(b.x+280,y);await p.mouse.down();await p.mouse.move(b.x+277,y);assert.equal(await list.evaluate(e=>/is-drag/.test(e.className)),false);
  await p.mouse.move(b.x+100,y,{steps:12});const moved=await list.evaluate(e=>e.scrollLeft);await p.mouse.up();await p.waitForTimeout(200);
  out.mouseDrag={moved,active:await list.evaluate(e=>/is-drag/.test(e.className))};assert(moved>30);assert.equal(out.mouseDrag.active,false);
  await p.close();
 }
 {
  const p=await open({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const list=p.locator(SEL.list);await list.scrollIntoViewIfNeeded();
  await p.waitForTimeout(1600);const caption=p.locator('a.gv-card').first().locator('.gv-card-t');await caption.scrollIntoViewIfNeeded();
  const b=await caption.boundingBox(),y=Math.max(20,Math.min(800,b.y+15));
  const cdp=await p.context().newCDPSession(p);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:270,y}]});
  for(let x=250;x>=80;x-=20){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y}]});await p.waitForTimeout(20);}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(700);
  out.touchSwipe=await list.evaluate(e=>e.scrollLeft);assert(out.touchSwipe>30);
  out.touchOverlay=await p.locator('.gv-card-ov').first().evaluate(e=>getComputedStyle(e).opacity);assert.equal(out.touchOverlay,'1');await p.close();
 }
 {
  const p=await open({reducedMotion:'reduce'});out.reducedHero=await p.locator('.gv-portrait, .pco-gv-portrait').evaluate(e=>getComputedStyle(e).animationName);assert.equal(out.reducedHero,'none');
  await p.locator('a.gv-card').first().hover();out.reducedCard=await p.locator('a.gv-card').first().evaluate(e=>getComputedStyle(e).transform);assert.equal(out.reducedCard,'none');await p.close();
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({label,out,errors},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
