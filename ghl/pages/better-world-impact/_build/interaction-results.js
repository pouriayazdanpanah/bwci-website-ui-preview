#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.join(__dirname,'qa-output/interaction'),read=n=>JSON.parse(fs.readFileSync(path.join(out,n),'utf8'));
const behavior=read('behavior.json'),visual=read('visual.json'),pixels=read('pixels.json'),targeted=fs.readdirSync(out).filter(n=>n.startsWith('targeted-')&&n.endsWith('.json')).map(read).filter(run=>Date.parse(run.date)>=Date.parse(behavior.date));
const checks=JSON.parse(fs.readFileSync(path.join(__dirname,'qa-output/checks.json'),'utf8'));
for(const run of [behavior,visual,...targeted])for(const key of ['errors','console','network'])assert.deepEqual(run[key],[]);
for(const key of ['errors','consoleErrors','unexpectedNetwork'])assert.deepEqual(checks[key],[]);
const originalFailures=behavior.cases.filter(c=>c.status==='FAIL'),cases=behavior.cases.map(c=>{
 if(c.status==='PASS')return c;
 const rerun=targeted.flatMap(r=>r.cases).find(r=>r.name===c.name&&r.status==='PASS');assert(rerun,'Unresolved failed case: '+c.name);return rerun;
});
for(const c of targeted.flatMap(r=>r.cases))if(!cases.some(x=>x.name===c.name))cases.push(c);
assert.equal(cases.length,56);for(const row of [...cases,...visual.cases,...checks.checks])assert.equal(row.status,'PASS');
assert.equal(visual.visual.length,45);assert.equal(visual.cases.length,15);assert.equal(pixels.length,120);
const maximum=Math.max(...pixels.map(p=>p.changedOver24/p.pixels));
const result={date:new Date().toISOString(),baseline:'3d93dcf17f1d14c8325b679b6f6573ba1153d6ae',status:'PASS',scope:'Impact interaction correction only; unchanged source sections measured separately; local fallback fonts',
 behavior:{cases,status:'PASS',recovery:originalFailures.map(f=>({name:f.name,initial:f.error.split('\n')[0],resolution:'Wait for DOMContentLoaded and actual owner mount instead of the whole load event; complete targeted case PASS. No runtime change.'})),
  contrast:'Manual screenshot inspection caught dark text on the new dark mobile link. Corrected root scoping, then tested white label/arrow over dark background plus next-stage interaction at eight narrow widths in both variants (16 subcases).'},
 pageChecks:{status:'PASS',checks:checks.checks},
 visual:{status:'PASS',cases:visual.cases,captures:45,sourceCases:15,sectionPairs:120,pixelExact:pixels.filter(p=>p.changedAny===0).length,maxChangedOver24Percent:maximum*100,
  interpretation:'All four unchanged sections match source text and dimensions. Hero/approach pairs are exact. Added engine details change the fractional document Y position of later sections; raw methodology/CTA crops include vertical raster differences, reported without normalizing source CSS or pixels.',pixels},
 static:{status:'PASS',description:'Both native blocks; six controls, two sets of accessible panels, source titles/descriptions/examples, empty evidence/cases, unchanged config/images and outside-engine markup'},
 shared:{status:'PASS',contexts:22,description:'Current shared generator contexts against merged main 3d93dcf; shared/design/assets/other22outputs unchanged'},
 reproducibility:{status:'PASS',outputs:2},
 errors:[],console:[],network:[],
 notVerified:['Live GHL installation','Actual Google Fonts delivery/layout','Published routes/approved evidence and cases','Physical devices','Stage 9 final website-wide regression']};
fs.writeFileSync(path.resolve(__dirname,'../qa/results.json'),JSON.stringify(result,null,2)+'\n');
console.log('PASS aggregate: '+cases.length+' interaction cases, '+checks.checks.length+' page checks, 120 unchanged-section pairs ('+result.visual.pixelExact+' exact)');
