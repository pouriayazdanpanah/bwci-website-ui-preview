// Dev-only: height/orientation and motion comparisons using the existing screenshot settling procedure.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const routeReact=require('./qa-routes');
const ready=require('./qa-ready');
const base=(process.argv[2]||'http://127.0.0.1:8765/').replace(/\/?$/,'/');
const sourceBase=(process.env.BWCI_QA_SOURCE_BASE||base).replace(/\/?$/,'/');
const out=path.resolve(process.argv[3]||'output/playwright/richard-werner/extra');
(async()=>{const browser=await chromium.launch({channel:process.env.BWCI_QA_CHANNEL||'chrome'});
 for(const [key,width,height,reducedMotion] of [['phone-short',390,600,'reduce'],['desktop-short',1440,600,'reduce'],['desktop-tall',1440,1200,'reduce'],['landscape',844,390,'reduce'],['motion',1440,900,'no-preference']]){
  for(const type of ['source','port']){
   const page=await browser.newPage({viewport:{width,height},reducedMotion}),errors=[];
   page.on('pageerror',e=>errors.push(String(e)));await routeReact(page);
   await ready(page,(type==='source'?sourceBase+'design/Profile%20Professor%20Richard%20Werner.dc.html':base+'ghl/pages/profile-richard-werner/_build/preview/plain.html'));await page.waitForTimeout(3000);
   await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=Math.round(innerHeight*.6)){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,60));}await new Promise(r=>setTimeout(r,1800));scrollTo({top:0,behavior:'instant'});});await page.waitForTimeout(600);await ready.staticPose(page);
   const dir=path.join(out,key,type);fs.mkdirSync(dir,{recursive:true});await page.screenshot({path:path.join(dir,'w'+width+'.png'),fullPage:true});
   console.log(JSON.stringify({key,type,width,height,...await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,height:document.documentElement.scrollHeight})),errors}));await page.close();
  }
 }await browser.close();})().catch(e=>{console.error(e);process.exit(1)});
