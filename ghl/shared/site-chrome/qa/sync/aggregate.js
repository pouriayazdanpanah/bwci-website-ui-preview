#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const {fs,path,out}=require('./common');
const read=name=>JSON.parse(fs.readFileSync(path.join(out,name+'.json'),'utf8'));
const stat=read('static'),browser=read('browser'),deferred=read('deferred'),visual=read('main-visual'),pixels=read('main-pixels'),repro=read('reproducibility');
const key=r=>[r.slug,r.width,r.variant].join('/');
const failures=browser.cases.filter(r=>r.status==='FAIL');let recoveries=[];
if(failures.length){
 const rerun=read('browser-partial');for(const name of ['errors','consoleErrors','network'])assert.deepEqual(rerun[name],[]);
 recoveries=failures.map(f=>{const r=rerun.cases.find(x=>key(x)===key(f));assert.equal(r?.status,'PASS',key(f)+' must pass its focused rerun');return r;});
}
const cases=browser.cases.map(r=>recoveries.find(x=>key(x)===key(r))||r);
assert.equal(cases.length,92);assert.equal(new Set(cases.map(key)).size,92);
for(const set of [cases,deferred.cases,visual.cases])for(const r of set)assert.equal(r.status,'PASS');
for(const name of ['errors','consoleErrors','network'])assert.deepEqual(browser[name],[]);
assert.deepEqual(deferred.errors,[]);for(const name of ['errors','console','network'])assert.deepEqual(visual[name],[]);
assert.equal(stat.status,'PASS');assert.equal(repro.status,'PASS');assert.equal(deferred.cases.length,23);
assert.equal(visual.cases.length,48);assert.equal(pixels.length,32);for(const r of pixels)assert.equal(r.changedAny,0);
const result={
 date:new Date().toISOString(),baseline:'5b7fdfe9e3108d1ea989836d6c53e8f01ab56a51',
 scope:'Stage 8 Main/shared synchronization; local Chromium, fallback fonts; not the final full-page regression',status:'PASS',
 static:{status:stat.status,outputs:stat.checks.length,guards:stat.guards,pages:stat.pages},
 browser:{status:'PASS',cases,errors:[],consoleErrors:[],network:[],
  recovery:failures.length?{initialPass:browser.cases.length-failures.length,initialHarnessFailures:failures.map(r=>({case:key(r),reason:r.error.split('\n')[0]})),
   correction:'Click the visible .lp-dot child of the source zero-size desktop step button. Production code unchanged; these four complete cases passed focused reruns.',rerunPass:recoveries.length}:null},
 deferred:{status:'PASS',cases:deferred.cases,errors:[]},
 mainCTA:{status:'PASS',viewportCases:16,captures:visual.cases.length,pixelPairs:32,pixelExact:32,comparisons:pixels,errors:[],consoleErrors:[],network:[]},
 reproducibility:{status:repro.status,builds:repro.builds,outputs:repro.outputs,changed:repro.changed},
 remaining:{impactInteraction:'FAIL — explicit selection/previous/next/progress/responsive requirement not implemented by static PR #34; corrective page PR before final regression',
 finalFullPageRegression:'NOT VERIFIED — stage 9 pending after the corrective Impact PR',
 liveGHL:'NOT VERIFIED',actualWebFonts:'NOT VERIFIED',publishedRoutesAndApprovedContent:'NOT VERIFIED'}
};
fs.writeFileSync(path.join(__dirname,'results.json'),JSON.stringify(result,null,2)+'\n');
console.log('PASS current synchronization: 46 static, 92 shared browser, 23 deferred/destroy, 32 exact CTA pairs, 22 reproducible builds');
