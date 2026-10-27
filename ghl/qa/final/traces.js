#!/usr/bin/env node
// Run existing page-specific interaction scenarios on the current source and current inline output.
// Preserve complete traces; compare semantic state separately from timings/scroll positions.
'use strict';
const {spawn}=require('node:child_process'),assert=require('node:assert/strict');
const {fs,path,repo,out,manifest,host,block}=require('./common');
const base=(process.argv[2]||'http://127.0.0.1:8125').replace(/\/$/,''),requested=process.argv.find(a=>a.startsWith('--slugs='))?.slice(8).split(',');
const rows=manifest().filter(r=>!r.slug.startsWith('profile-')&&!r.slug.startsWith('corporate-ir')&&r.slug!=='better-world-impact'&&(!requested||requested.includes(r.slug)));
const dir=path.join(out,'traces');fs.mkdirSync(dir,{recursive:true});
function run(file,url,label){return new Promise(resolve=>{const child=spawn(process.execPath,['--require',path.join(__dirname,'browser-preload.js'),file,url,label],{cwd:repo,env:process.env});let stdout='',stderr='';child.stdout.on('data',d=>stdout+=d);child.stderr.on('data',d=>stderr+=d);child.on('close',code=>resolve({code,stdout,stderr}));});}
(async()=>{for(const row of rows){const folder=path.join(dir,row.slug);fs.mkdirSync(folder,{recursive:true});const wrapper=path.join(folder,'port.html');fs.writeFileSync(wrapper,host(block(row.slug)));
 const file=path.join(repo,'ghl/pages',row.slug,row.slug==='main'?'qa':'_build','behaviour.js');
 const report={slug:row.slug,date:new Date().toISOString(),runs:[]};
 for(const kind of ['source','port']){
  const url=kind==='source'?base+'/design/'+encodeURIComponent(row.source):base+'/ghl/qa/final/output/traces/'+row.slug+'/port.html';
  const result=await run(file,url,kind);fs.writeFileSync(path.join(folder,kind+'.log'),result.stdout);fs.writeFileSync(path.join(folder,kind+'.stderr'),result.stderr);
  const errors=result.stdout.match(/^errors\s+(.*)$/m)?.[1];const status=result.code===0&&errors==='[]'?'PASS':'FAIL';report.runs.push({kind,status,exitCode:result.code,errors:errors??null,stderr:result.stderr});console.log(status+' trace '+row.slug+' '+kind);
 }
 fs.writeFileSync(path.join(folder,'results.json'),JSON.stringify(report,null,2)+'\n');
}})().catch(e=>{console.error(e);process.exitCode=1;});
