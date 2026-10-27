#!/usr/bin/env node
// Attribute export-template diagnostics separately from standalone native output errors.
'use strict';
const {chromium}=require('playwright'),{fs,path,out,manifest,prepare,port,ready,reveal}=require('./common');
const base=(process.argv[2]||'http://127.0.0.1:8125').replace(/\/$/,''),result={date:new Date().toISOString(),cases:[]};
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{for(const row of manifest().filter(r=>['platforms','ecosystem'].includes(r.slug)))for(const kind of ['source','inline','hosted']){
 const r={slug:row.slug,kind,errors:[],console:[],network:[]},p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});await prepare(p,r);
 try{const url=kind==='source'?base+'/design/'+encodeURIComponent(row.source):await port(p,row,kind,base);await ready(p,url,row);await reveal(p,true);for(const width of [320,964,1440]){await p.setViewportSize({width,height:900});await p.waitForTimeout(300);}r.heading=await p.locator('h1').innerText();r.status=kind==='source'?'OBSERVED':'PASS';if(kind!=='source'&&(r.errors.length||r.console.length||r.network.length))r.status='FAIL';}
 catch(e){r.status='FAIL';r.error=e.message;}finally{await p.close();result.cases.push(r);fs.writeFileSync(path.join(out,'source-diagnostics.json'),JSON.stringify(result,null,2)+'\n');console.log(r.status+' diagnostic '+row.slug+' '+kind+' console='+r.console.length);}
}}finally{await b.close();}if(result.cases.some(c=>c.status==='FAIL'))process.exitCode=1;})().catch(e=>{console.error(e);process.exitCode=1;});
