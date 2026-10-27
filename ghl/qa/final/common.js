'use strict';
const shared=require('../../shared/site-chrome/qa/sync/common');
const {fs,path,repo}=shared,out=path.join(__dirname,'output');fs.mkdirSync(out,{recursive:true});
const sources={main:'Main', 'financial-engine':'FinancialEngine',ecosystem:'Ecosystem',platforms:'Platforms','smes-projects':'SMEs Projects','investors-partners':'Investors Partners',governance:'Governance','governance-board':'Governance Board','governance-leadership':'Governance Leadership','better-world-impact':'Better World Impact','profile-farhad-reyazat':'Profile Farhad Reyazat','profile-alexander-alegria-saif':'Profile Alexander Alegria Saif','profile-gabriella-karlova':'Profile Gabriella Karlova','profile-richard-werner':'Profile Professor Richard Werner','profile-ewa-dudek':'Profile Ewa Dudek','profile-agnes-gradzewicz':'Profile Agnes Gradzewicz','profile-christie-osarenren':'Profile Christie Osarenren'};
const widths=[320,360,375,390,430,768,1024,1280,1366,1440,1600,1920,2560];
const people=require('../../shared/site-chrome/site-chrome').loadPeople();
function manifest(){return shared.manifest().map(r=>({...r,relatedCount:r.slug.startsWith('profile-')?people.board.filter(p=>p.slug!==r.slug.slice(8)).length:undefined,source:(r.slug.startsWith('corporate-ir')?'Corporate IR':sources[r.slug])+'.dc.html',hash:r.slug.startsWith('corporate-ir-')?'#'+r.slug.slice(13):''}));}
async function prepare(p,report){
 await require('../../pages/governance/_build/qa-routes')(p);
 await p.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,r=>r.abort());
 p.on('pageerror',e=>report.errors.push(String(e)));p.on('console',m=>{if(m.type()==='error'&&!/fonts\.(googleapis|gstatic)/.test(m.location().url))report.console.push(m.text());});
 p.on('requestfailed',r=>{if(!/fonts\.(googleapis|gstatic)/.test(r.url())&&r.failure().errorText!=='net::ERR_ABORTED')report.network.push(r.url()+': '+r.failure().errorText);});
 p.on('response',r=>{if(r.status()>=400)report.network.push(r.url()+': '+r.status());});
}
async function port(p,row,kind,base,aggressive=false,extra={},malformed=false){
 let html=shared.block(row.slug,kind),assets=new Map();
 if(kind==='hosted'){
  let i=0;function replace(v){if(typeof v==='string'&&v.startsWith('data:image/')){const url=base+'/__final__/asset/'+row.slug+'/'+i++;assets.set(url,v);return url;}if(Array.isArray(v))return v.map(replace);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,replace(x)]));return v;}
  extra={...replace(row.cfg),...extra};
  await p.route('**/__final__/asset/**',r=>{const m=assets.get(r.request().url())?.match(/^data:([^;]+);base64,(.*)$/s);if(!m)throw Error('Missing asset fixture '+r.request().url());return r.fulfill({contentType:m[1],body:Buffer.from(m[2],'base64')});});
 }
 html=shared.withConfig(html,extra);
 let wrapped=shared.host(html,aggressive,aggressive);if(malformed)wrapped=wrapped.replace(/(<script type="application\/json"[^>]*>)[\s\S]*?(<\/script>)/,'$1{invalid}$2');
 const url=base+'/__final__/'+row.slug+'/'+kind+'.html';
 await p.route(url+'*',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:wrapped}));return url;
}
async function ready(p,url,row){
 for(let attempt=0;attempt<2;attempt++){
  try{
   await p.goto(url,{waitUntil:'domcontentloaded'});await p.locator('h1').waitFor({timeout:15000});
   if(row.slug.startsWith('profile-'))await p.waitForFunction(({prefix,count})=>document.querySelectorAll('a.gv-card').length===count&&[...document.querySelectorAll('image-slot, .'+prefix+'-slot')].length===count+1&&[...document.querySelectorAll('image-slot, .'+prefix+'-slot')].every(e=>{const i=e.shadowRoot?e.shadowRoot.querySelector('img'):e.querySelector('img');return i&&i.complete&&i.naturalWidth>0;}),{prefix:row.prefix,count:row.relatedCount},{timeout:15000});
   await p.waitForFunction(()=>[...document.images].filter(i=>i.getAttribute('src')&&i.loading!=='lazy').every(i=>i.complete&&i.naturalWidth>0),{},{timeout:15000});
   await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(2900);return;
  }catch(e){if(attempt)throw e;}
 }
}
async function reveal(p,initial=false){
 await p.bringToFront();
 await p.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=Math.round(innerHeight*.65)){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,65));}});
 await p.waitForTimeout(initial?1100:250);
 // Full-page screenshots include offscreen content. Visit any still-pending reveal target itself,
 // rather than assuming a fast scroll-through delivered every intersection callback.
 let moved=false;
 for(const el of await p.locator('[data-bw-rv="wait"],.rv,.sr,[class*="-rv"],[class*="-sr"]').elementHandles()){
  const pending=await el.evaluate(e=>{
   if(!e.isConnected||e.closest('[hidden],[aria-hidden="true"],[inert]')||!e.getClientRects().length||getComputedStyle(e).visibility==='hidden')return false;
   if(e.getAttribute('data-bw-rv')==='wait')return true;
   for(let a=e;a&&a!==document.body;a=a.parentElement)if(Number(getComputedStyle(a).opacity)<.99)return true;return false;
  });
  if(pending){await el.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.waitForTimeout(160);moved=true;}
 }
 if(moved)await p.waitForTimeout(1100);
 await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.waitForTimeout(100);
}

module.exports={...shared,out,sources,widths,manifest,prepare,port,ready,reveal};
