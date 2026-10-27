#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.join(__dirname,'output'),read=n=>JSON.parse(fs.readFileSync(path.join(out,n+'.json'),'utf8'));
const stat=read('static'),unit=read('unit'),browser=read('browser'),rebuild=read('reproducibility');
assert.equal(stat.status,'PASS');assert.equal(unit.status,'PASS');assert.equal(rebuild.status,'PASS');
assert.equal(stat.pages.length,23);assert.equal(stat.settings,73);assert.equal(stat.images,20);assert.equal(stat.existingKeys,14);assert.equal(stat.newKeys,6);
assert.equal(browser.cases.length,184);assert.equal(new Set(browser.cases.map(c=>[c.slug,c.kind,c.mode].join('/'))).size,184);assert(browser.cases.every(c=>c.status==='PASS'));
for(const k of ['errors','console','network'])assert.deepEqual(browser[k],[]);
const resolved=browser.cases.filter(c=>c.mode==='resolved');assert.equal(resolved.length,46);assert.equal(new Set(resolved.flatMap(c=>c.imageIDs)).size,20);
const maximum=Math.max(...resolved.map(c=>c.maxGeometryDelta)),pairs=resolved.reduce((n,c)=>n+c.geometryChecks,0);assert(maximum<=1);
assert.equal(rebuild.builds,22);assert.equal(rebuild.outputs,46);assert.deepEqual(rebuild.changed,[]);
const result={date:new Date().toISOString(),baseline:'52b3cc50906b7e2619273e76d24f99c4e90e7b17',status:'PASS_LOCAL',coverage:{pages:23,outputs:46,imageSettings:73,uniqueImages:20,existingKeys:14,proposedKeys:6,unitChecks:unit.checks,browserCases:184,imageGeometryPairs:pairs,maxGeometryDelta:maximum,reproducibleBuilders:22},static:stat,unit,browser,reproducibility:{status:'PASS',builds:22,outputs:46},limits:['Six proposed keys must be created by the owner in GHL','URLs/values for the 13 newly supplied image keys were not provided and were not verified','Actual GHL substitution inside JSON, cache propagation and published image delivery NOT VERIFIED','No live GHL API calls, account changes or publication performed']};
fs.writeFileSync(path.join(__dirname,'results.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,coverage:result.coverage},null,2));
