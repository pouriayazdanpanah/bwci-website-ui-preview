#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.join(__dirname,'output'),read=n=>JSON.parse(fs.readFileSync(path.join(out,n+'.json'),'utf8'));
const stat=read('static'),unit=read('unit'),browser=read('browser'),build=read('reproducibility');
assert.equal(stat.status,'PASS');assert.equal(unit.status,'PASS');assert.equal(build.status,'PASS');
assert.equal(stat.pages.length,23);assert.equal(stat.linkEntries,704);assert.equal(stat.convertedEntries,702);assert.equal(stat.uniqueCustomValues,43);
assert.equal(browser.cases.length,184);assert(browser.cases.every(c=>c.status==='PASS'));for(const key of ['errors','console','network'])assert.deepEqual(browser[key],[]);
assert.equal(new Set(browser.cases.map(c=>[c.slug,c.kind,c.mode].join('/'))).size,184);
assert.equal(browser.cases.filter(c=>c.mode==='available'&&c.navigationTarget).length,46);
assert.equal(build.builds,22);assert.equal(build.outputs,46);assert.deepEqual(build.changed,[]);
const result={date:new Date().toISOString(),baseline:'a41c1aea9e770f5dd115b33fe465bfa66d1a45f0',status:'PASS_LOCAL',coverage:{pages:23,outputs:46,linkEntries:704,convertedEntries:702,preservedLocalAnchors:2,existingCustomValues:43,unrelatedOrLegacyValues:3,unitChecks:unit.checks,browserCases:184,mockedNavigations:46,reproducibleBuilders:22},static:stat,browser,unit,reproducibility:{status:'PASS',builds:22,outputs:46,changed:[]},limits:['Actual GHL substitution inside application/json and cache propagation NOT VERIFIED','Published destinations and real URLs remain unavailable: all 43 used Custom Values are #','Real web-font delivery and physical devices NOT VERIFIED','No live GHL account mutation, publication or deployment performed']};
fs.writeFileSync(path.join(__dirname,'results.json'),JSON.stringify(result,null,2)+'\n');
const columns=['page','hostedOutput','inlineOutput'];const rows=stat.pages.map(p=>[p.slug,'ghl/pages/'+p.slug+'/'+p.slug+'.ghl.html','ghl/pages/'+p.slug+'/'+p.slug+'.inline.ghl.html']);
fs.writeFileSync(path.join(__dirname,'updated-pages.csv'),[columns,...rows].map(r=>r.join(',')).join('\n')+'\n');
console.log(JSON.stringify({status:result.status,coverage:result.coverage},null,2));
