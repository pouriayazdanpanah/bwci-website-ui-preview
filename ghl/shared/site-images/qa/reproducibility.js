#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
require('../../site-chrome/qa/sync/reproducibility');
const out=path.join(__dirname,'output');fs.mkdirSync(out,{recursive:true});
const r=JSON.parse(fs.readFileSync(path.join(__dirname,'../../site-chrome/qa/sync/output/reproducibility.json'),'utf8'));
fs.writeFileSync(path.join(out,'reproducibility.json'),JSON.stringify({...r,date:new Date().toISOString()},null,2)+'\n');
