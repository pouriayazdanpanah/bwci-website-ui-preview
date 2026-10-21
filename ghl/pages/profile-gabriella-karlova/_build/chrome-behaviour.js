// Run the existing shared interaction trace with the profile prefix normalized as the other page prefixes.
require('./qa-browser');
const fs=require('fs'),path=require('path'),Module=require('module');
const file=path.resolve(__dirname,'../../../shared/site-chrome/qa/chrome-behaviour.js');
const code=fs.readFileSync(file,'utf8').replace(/\(plt\|sme\|inv\|eco\|fe\|gov\|gvb\|gvl\|bw\|bwci\)/g,'(plt|sme|inv|eco|fe|gov|gvb|gvl|pgk|bw|bwci)');
const qa=new Module(file,module);qa.filename=file;qa.paths=module.paths;qa._compile(code,file);
