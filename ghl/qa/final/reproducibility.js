#!/usr/bin/env node
// Rebuild the 22 generated pages and preserve both directly edited Main variants.
'use strict';
const assert=require('node:assert/strict'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const {fs,path,pages,out,manifest}=require('./common');
const rows=manifest(),hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const files=rows.flatMap(r=>['.ghl.html','.inline.ghl.html'].map(s=>path.join(pages,r.slug,r.slug+s)));
const before=Object.fromEntries(files.map(f=>[f,hash(f)]));let builds=0;
for(const row of rows.filter(r=>r.slug!=='main')){
 const build=path.join(pages,row.slug,'_build/build.js'),run=spawnSync(process.execPath,[build],{encoding:'utf8'});
 assert.equal(run.status,0,row.slug+': '+run.stderr);builds++;
}
const changed=files.filter(f=>hash(f)!==before[f]);assert.deepEqual(changed,[]);
fs.writeFileSync(path.join(out,'reproducibility.json'),JSON.stringify({date:new Date().toISOString(),status:'PASS',builds,outputs:files.length,changed,sha256:before},null,2)+'\n');
console.log('PASS final reproducibility: '+builds+' builders, '+files.length+' stable outputs');
