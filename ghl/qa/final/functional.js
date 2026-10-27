#!/usr/bin/env node
// Sequential browser jobs beside the independent responsive matrix. Focused diagnostics run separately when needed.
'use strict';
const {spawn}=require('node:child_process');
const {fs,path,repo,out}=require('./common'),base=process.argv[2]||'http://127.0.0.1:8125';
const dir=path.join(out,'functional');fs.mkdirSync(dir,{recursive:true});
const jobs=[
 ['feature-traces', ['ghl/qa/final/traces.js',base,'--slugs=platforms,smes-projects,investors-partners,governance,governance-board,governance-leadership']],
 ['profiles', ['ghl/qa/final/profiles.js',base]],
 ...['corporate-ir','corporate-ir-company-information','corporate-ir-reports-documents','corporate-ir-shareholders','corporate-ir-regulatory','corporate-ir-legal-notices'].map(s=>[s,['ghl/pages/'+s+'/_build/qa.js',base,'--checks-only']]),
 ['impact-interaction',['ghl/pages/better-world-impact/_build/interaction-qa.js',base,'--behavior-only']],
 ['impact-page',['ghl/pages/better-world-impact/_build/qa.js',base,'--checks-only']],
 ['shared-92',['ghl/shared/site-chrome/qa/sync/browser.js',base]],
 ['deferred-23',['ghl/shared/site-chrome/qa/sync/deferred.js',base]],
];
const report={date:new Date().toISOString(),jobs:[]};
(async()=>{for(const [name,args]of jobs){
 if(name.startsWith('corporate-ir')||name==='impact-page'){
  const slug=name==='impact-page'?'better-world-impact':name;const r=spawn(process.execPath,['ghl/pages/'+slug+'/_build/make-previews.js'],{cwd:repo});await new Promise(resolve=>r.on('close',resolve));
 }
 console.log('START '+name);let stdout='',stderr='';const child=spawn(process.execPath,args,{cwd:repo,env:process.env});child.stdout.on('data',d=>stdout+=d);child.stderr.on('data',d=>stderr+=d);const code=await new Promise(resolve=>child.on('close',resolve));
 fs.writeFileSync(path.join(dir,name+'.log'),stdout);fs.writeFileSync(path.join(dir,name+'.stderr'),stderr);const status=code===0&&!/^FAIL /m.test(stdout)?'PASS':'FAIL';report.jobs.push({name,status,exitCode:code,stderr});fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(report,null,2)+'\n');console.log(status+' job '+name);
}if(report.jobs.some(r=>r.status==='FAIL'))process.exitCode=1;})().catch(e=>{console.error(e);process.exitCode=1;});
