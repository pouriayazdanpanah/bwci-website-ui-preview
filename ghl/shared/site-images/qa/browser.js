#!/usr/bin/env node
// Local GHL-substitution model; mock image URLs serve the unchanged repository assets.
'use strict';
const assert=require('node:assert/strict'),{chromium}=require('playwright'),images=require('..');
const common=require('../../site-chrome/qa/sync/common'),{fs,path}=common,out=path.join(__dirname,'output');fs.mkdirSync(out,{recursive:true});
const baseline='/tmp/bwci-images-baseline/ghl/pages',requested=process.argv.find(a=>a.startsWith('--slugs='))?.slice(8).split(',');
const report={date:new Date().toISOString(),cases:[],errors:[],console:[],network:[],liveGHL:'NOT VERIFIED'};
const url=(id,version='first')=>'https://bwci-image.qa.invalid/'+version+'/'+id;
function render(html,mode,version='first'){
 if(mode==='raw')return html;
 for(const [id,d]of Object.entries(images.definitions))html=html.split(d.fieldKey).join(mode==='resolved'?url(id,version):mode==='empty'?'':'#');
 return html;
}
async function prepare(p){
 await p.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,r=>r.abort());
 await p.route('https://bwci-image.qa.invalid/**',r=>{const id=new URL(r.request().url()).pathname.split('/').at(-1),d=images.definitions[id];assert(d,'Known image fixture');const ext=path.extname(d.asset).slice(1),type=ext==='jpg'?'jpeg':ext;return r.fulfill({contentType:'image/'+type,body:fs.readFileSync(path.join(common.repo,d.asset))});});
 p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts\.(googleapis|gstatic)/.test(m.location().url))report.console.push(m.text());});
 p.on('requestfailed',r=>{if(!/fonts\.(googleapis|gstatic)/.test(r.url()))report.network.push(r.url());});
 p.on('request',r=>{if(/custom_values|%7B%7B|REPLACE-WITH/i.test(r.url()))report.network.push('Invalid image request: '+r.url());});
}
async function ready(p,row,loaded=true){
 await p.waitForFunction(k=>!!window[k]?.instance,row.owner);
 if(loaded){for(const img of await p.locator('#'+row.root+' img[loading="lazy"]').elementHandles())await img.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
  await p.waitForFunction(root=>[...document.getElementById(root).querySelectorAll('img')].every(i=>i.complete&&i.naturalWidth>0),row.root);
 }
 await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(150);
}
async function snapshot(p,row){return p.evaluate(({root,P})=>[...document.getElementById(root).querySelectorAll('img')].map(img=>{
 const person=img.getAttribute('data-'+P+'-person'),asset=img.getAttribute('data-'+P+'-asset'),r=img.getBoundingClientRect(),parent=img.parentElement.getBoundingClientRect();
 return {person,asset,src:img.getAttribute('src'),natural:[img.naturalWidth,img.naturalHeight],box:[r.width,r.height,parent.width,parent.height,r.x-parent.x,r.y-parent.y]};
}),{root:row.root,P:row.prefix});}
function verify(pictures,row,kind,mode,version='first'){
 const entries=images.entries(row.cfg),ids=new Set();
 for(const img of pictures){const key=img.person?'peopleImages.'+img.person:Object.hasOwn(row.cfg,img.asset)?img.asset:'images.'+img.asset,e=entries.find(e=>e.path===key);assert(e,row.slug+' every image mapped '+key);
  ids.add(e.id);if(mode==='resolved')assert.equal(img.src,url(e.id,version),'Central image URL wins over fallback');
  else if(kind==='inline')assert.equal(img.src,images.get(row.cfg.imageFallbacks,e.parts),'Exact original inline fallback');
  else assert.equal(img.src,null,'No request for missing hosted image');
 }
 assert(pictures.filter(i=>i.asset==='logoImage').length>=2,'Header, drawer and footer use the central logo');
 return [...ids];
}
async function replace(p,row,html){
 const cfg=common.parse(html).cfg,css=html.match(/<style>([\s\S]*?)<\/style>/)[1],root=await p.locator('#'+row.root).evaluate(e=>e.outerHTML);
 const contents='<script type="application/json" id="'+row.config+'">'+JSON.stringify(cfg).replace(/</g,'\\u003c')+'</script><style>'+css+'</style>'+root;
 await p.evaluate(k=>{window.__oldImageInstance=window[k].instance;},row.owner);
 await p.evaluate(html=>{document.querySelector('#sync-host').outerHTML='<section id="sync-host" style="padding:0;background:none">'+html+'</section>';},contents);
 await p.waitForFunction(k=>!!window[k]?.instance&&window[k].instance!==window.__oldImageInstance,row.owner);
}
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{
 for(const row of common.manifest().filter(r=>!requested||requested.includes(r.slug)))for(const kind of ['hosted','inline'])for(const mode of ['resolved','raw','empty','pending']){
  const rec={slug:row.slug,kind,mode,status:'PASS'},p=await browser.newPage({viewport:{width:390,height:900},reducedMotion:'reduce'});await prepare(p);let old;
  try{
   const html=render(common.block(row.slug,kind),mode);common.parse(html);await p.setContent(common.host(html,true),{waitUntil:'domcontentloaded'});await ready(p,row,mode==='resolved'||kind==='inline');
   let pictures=await snapshot(p,row);rec.imageIDs=verify(pictures,row,kind,mode);rec.images=pictures.length;
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
   if(mode==='resolved'){
    old=await browser.newPage({viewport:{width:390,height:900},reducedMotion:'reduce'});await prepare(old);await old.setContent(common.host(common.block(row.slug,'inline',baseline),true),{waitUntil:'domcontentloaded'});await ready(old,row,true);
    rec.geometryChecks=0;rec.maxGeometryDelta=0;
    for(const width of [390,1440]){
     await p.setViewportSize({width,height:900});await old.setViewportSize({width,height:900});await p.waitForTimeout(250);await old.waitForTimeout(250);
     const current=await snapshot(p,row),reference=await snapshot(old,row);assert.equal(current.length,reference.length);
     for(let i=0;i<current.length;i++){assert.deepEqual(current[i].natural,reference[i].natural,'Original image dimensions');for(let j=0;j<6;j++){const delta=Math.abs(current[i].box[j]-reference[i].box[j]);rec.maxGeometryDelta=Math.max(rec.maxGeometryDelta,delta);assert(delta<=1,'Original image fit/frame geometry');}rec.geometryChecks++;}
    }
    // GHL can clone already-loaded markup. Confirm central URL changes, then safe unavailability/fallback.
    await replace(p,row,render(common.block(row.slug,kind),'resolved','second'));await ready(p,row,true);verify(await snapshot(p,row),row,kind,'resolved','second');
    await replace(p,row,render(common.block(row.slug,kind),'pending'));await ready(p,row,kind==='inline');verify(await snapshot(p,row),row,kind,'pending');
   }
  }catch(e){rec.status='FAIL';rec.error=e.message;}finally{if(old)await old.close();await p.close();report.cases.push(rec);fs.writeFileSync(path.join(out,requested?'browser-targeted.json':'browser.json'),JSON.stringify(report,null,2)+'\n');console.log(rec.status+' '+row.slug+' '+kind+' '+mode+(rec.error?' '+rec.error.split('\n')[0]:''));}
 }
}finally{await browser.close();}if(report.cases.some(c=>c.status==='FAIL')||report.errors.length||report.console.length||report.network.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
