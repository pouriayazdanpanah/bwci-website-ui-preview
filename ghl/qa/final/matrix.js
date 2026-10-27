#!/usr/bin/env node
// Current rendered source/port matrix. Reuses each fully mounted page across widths; no source CSS or
// reveal state is rewritten. All screenshots and raw geometry remain inspectable under ignored output.
'use strict';
const assert=require('node:assert/strict'),{chromium}=require('playwright');
const {fs,path,out,manifest,widths,prepare,port,ready,reveal}=require('./common');
const base=(process.argv[2]||'http://127.0.0.1:8125').replace(/\/$/,''),arg=n=>process.argv.find(a=>a.startsWith('--'+n+'='))?.split('=').slice(1).join('=');
const slugs=arg('slugs')?.split(','),selectedWidths=arg('widths')?.split(',').map(Number),recover=process.argv.includes('--recover'),recapture=new Set((arg('cases')||'').split(',').filter(Boolean));
const rows=manifest().filter(r=>!slugs||slugs.includes(r.slug));
async function snapshot(p){return p.evaluate(()=>{
 const vis=e=>{const s=getComputedStyle(e);return e.getClientRects().length&&s.display!=='none'&&s.visibility!=='hidden';};
 const main=document.querySelector('main')||document.body,sections=[...main.querySelectorAll('section')].filter(e=>{const parent=e.parentElement.closest('section');return e.id!=='sync-host'&&vis(e)&&(!parent||parent.id==='sync-host');});
 return {docWidth:document.documentElement.scrollWidth,docHeight:document.documentElement.scrollHeight,heading:main.querySelector('h1').innerText,
  sections:sections.map(e=>{const r=e.getBoundingClientRect();return {id:e.id,x:r.x,y:r.y+scrollY,width:r.width,height:r.height,text:e.innerText.replace(/\s+/g,' ').trim()};}),
  images:[...document.images].filter(i=>i.getAttribute('src')).map(i=>({loaded:i.complete&&i.naturalWidth>0,natural:[i.naturalWidth,i.naturalHeight]}))};
 });}
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{for(const row of rows){
 const dir=path.join(out,'matrix',row.slug);fs.mkdirSync(dir,{recursive:true});let prior;const resultFile=path.join(dir,'results.json');if(recover&&fs.existsSync(resultFile)){prior=JSON.parse(fs.readFileSync(resultFile,'utf8'));const attempts=path.join(dir,'attempts');fs.mkdirSync(attempts,{recursive:true});fs.writeFileSync(path.join(attempts,'before-recovery-'+Date.now()+'.json'),JSON.stringify(prior,null,2)+'\n');}
 const report={slug:row.slug,source:row.source,hash:row.hash,date:new Date().toISOString(),cases:[],errors:[],console:[],network:[]};
 if(prior){assert.deepEqual(prior.errors,[]);assert.deepEqual(prior.console,[]);assert.deepEqual(prior.network,[]);report.cases=prior.cases.filter(c=>c.status==='PASS'&&!recapture.has(c.width+'x'+c.height));report.recovery={previousDate:prior.date,mountFailure:prior.mountFailure||null,failed:prior.cases.filter(c=>c.status==='FAIL').map(c=>({width:c.width,height:c.height,error:c.error})),retainedPasses:report.cases.length};}
 const variants=[];
 try{
  for(const kind of ['source','inline','hosted']){
   const p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});variants.push({kind,p});await prepare(p,report);
   const url=kind==='source'?base+'/design/'+encodeURIComponent(row.source)+row.hash:await port(p,row,kind,base);await ready(p,url,row);await reveal(p,true);
  }
  const ws=selectedWidths||[...new Set([...widths,767,1023,...(row.slug.startsWith('corporate-ir')?[1099,1100,1101]:[]),...(row.slug==='ecosystem'?[963,964,965]:[])])].sort((a,b)=>a-b);
  const jobs=ws.map(width=>({width,height:900}));if(!selectedWidths)jobs.push({width:390,height:600},{width:1440,height:600},{width:1440,height:1200},{width:844,height:390});
  for(const job of jobs){if(recapture.size&&!recapture.has(job.width+'x'+job.height))continue;if(report.cases.some(c=>c.width===job.width&&c.height===job.height&&c.status==='PASS'))continue;const capture={...job,status:'PASS',variants:[]};try{
   for(const {kind,p} of variants){await p.bringToFront();await p.setViewportSize(job);await p.waitForTimeout(180);await reveal(p);const data=await snapshot(p);
    if(kind!=='source')assert(data.docWidth<=job.width,kind+' overflow '+data.docWidth);assert.equal(await p.locator('h1').isVisible(),true,kind+' heading');
    const screenshot=kind+'-'+job.width+'-'+job.height+'.png';await p.screenshot({path:path.join(dir,screenshot),fullPage:true,animations:'disabled',timeout:60000});capture.variants.push({kind,...data,screenshot});
   }
   const a=capture.variants[0];for(const v of capture.variants.slice(1)){assert.equal(v.heading,a.heading,'heading');
    const text=x=>x.sections.filter(s=>row.slug!=='better-world-impact'||!s.id.endsWith('engine')).map(s=>s.text);
    assert.deepEqual(text(v),text(a),v.kind+' section content');
   }
  }catch(e){capture.status='FAIL';capture.error=e.message;}report.cases.push(capture);fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(report,null,2)+'\n');console.log(capture.status+' matrix '+row.slug+' '+job.width+'x'+job.height+(capture.error?' '+capture.error.split('\n')[0]:''));
  }
 }catch(e){report.mountFailure=e.message;console.log('FAIL mount '+row.slug+' '+e.message.split('\n')[0]);}
 finally{for(const {p}of variants)await p.close();fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(report,null,2)+'\n');}
}}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
