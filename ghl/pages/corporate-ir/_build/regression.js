#!/usr/bin/env node
// Smoke the unchanged existing inline blocks; full shared-output migration/regression is a later PR.
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=(process.argv[2]||'http://127.0.0.1:8123').replace(/\/$/,'');
const pages=path.resolve(__dirname,'../..');
const rows=[];
(async()=>{
  const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  try {
    const slugs=fs.readdirSync(pages).filter(s=>s!=='corporate-ir'&&fs.existsSync(path.join(pages,s,s+'.inline.ghl.html')));
    assert.equal(slugs.length,16);
    for(const slug of slugs)for(const width of [390,1440]){
      const p=await b.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
      const errors=[];p.on('pageerror',e=>errors.push(String(e)));
      await p.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,r=>r.abort());
      await p.route('**/__qa__/regression/**',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0}</style></head><body>'+fs.readFileSync(path.join(pages,slug,slug+'.inline.ghl.html'),'utf8')+'</body></html>'}));
      await p.goto(base+'/__qa__/regression/'+slug+'.html');
      await p.waitForTimeout(200);
      assert.equal(await p.locator('h1').count(),1,slug+' heading');
      assert.equal(await p.locator('h1').isVisible(),true,slug+' heading visible');
      assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,slug+' overflow');
      assert.deepEqual(errors,[],slug+' JavaScript errors');
      rows.push({slug,width,status:'PASS'});await p.close();
    }
    fs.mkdirSync(path.join(__dirname,'qa-output'),{recursive:true});
    fs.writeFileSync(path.join(__dirname,'qa-output','regression.json'),JSON.stringify({date:new Date().toISOString(),scope:'Smoke only: unchanged prior outputs, fallback fonts, not a broad synchronization or full interaction/visual regression',rows},null,2)+'\n');
    console.log('PASS 16 unchanged existing pages at 390px and 1440px: heading, overflow, JavaScript smoke');
  } finally {await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
