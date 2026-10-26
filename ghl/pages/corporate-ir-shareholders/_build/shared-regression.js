#!/usr/bin/env node
// Compare the shared generator to this page branch's merged-main baseline without changing design/.
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const file=path.resolve(__dirname,'../../../shared/site-chrome/site-chrome.js');
let baseline;
if(process.argv[2])baseline=fs.readFileSync(process.argv[2],'utf8');
else {
  try {baseline=execFileSync('git',['show','65a5a44:ghl/shared/site-chrome/site-chrome.js'],{encoding:'utf8'});}
  catch {throw new Error('Cannot spawn git here. Export the baseline with git show 65a5a44:ghl/shared/site-chrome/site-chrome.js and pass that file path.');}
}
function load(source,customFS=fs){
  const mod={exports:{}};
  const wrapped=vm.runInThisContext('(function(require,module,exports,__dirname){'+source+'\n})');
  wrapped(n=>n==='fs'?customFS:require(n),mod,mod.exports,path.dirname(file));
  return mod.exports;
}
const before=load(baseline),after=require(file);
const contexts=[
  {current:'home',system:false,breadcrumb:null,links:{impact:'#bwci-impact',today:'#bwci-today'}},
  ...['engine','ecosystem','platforms','smes','investors','governance','ir'].map(current=>({current,breadcrumb:current,content:true,...(current==='governance'?{govnav:'hub'}:{})})),
  {current:'governance',breadcrumb:'gov-board',govnav:'board',content:true,people:true},
  {current:'governance',breadcrumb:'gov-leadership',govnav:'leadership',content:true,people:true},
  {current:'ir',breadcrumb:'ir',label:'Company information',content:true},
  {current:'ir',breadcrumb:'ir',label:'Reports & documents',content:true},
  ...['Farhad Reyazat','Alex Alegria-Seif','Gabriella Karlova','Professor Richard A. Werner','Ewa Dudek','Agnes Gradzewicz','Christie Osarenren'].map((name,i)=>({current:'governance',breadcrumb:'gov-profile',profile:{name,via:i<3?'board':'leadership'},govnav:i<3?'board':'leadership',content:true,people:true})),
];
for(const [i,context]of contexts.entries()){
  const opts={prefix:'reg'+i,rename:n=>'reg'+i+'-'+n,...context};
  const a=before(opts),b=after(opts);
  for(const key of ['header','breadcrumb','footer','govnav','runtime','links','unresolved','dynamicClasses'])assert.deepEqual(b[key],a[key],'Changed old context '+i+' '+key);
  assert.equal(b.css(),a.css(),'Changed old context '+i+' CSS');
}
assert.equal(contexts.length,19);
// Source's IR label branch is opt-in. Labels are escaped, and empty labels retain the overview trail.
const base={prefix:'t',current:'ir',breadcrumb:'ir',content:true};
assert.equal(after({...base,label:''}).breadcrumb,before(base).breadcrumb);
const labelled=after({...base,label:'Company <information> & history'}).breadcrumb;
assert(labelled.includes('Company &lt;information&gt; &amp; history'));
assert(labelled.includes('data-t-link="corporateIR"'));
const injected=Object.create(fs);
injected.readFileSync=function(f,encoding){const content=fs.readFileSync(f,encoding);return String(f).endsWith('SiteHeader.dc.html')?content.replace('Better%20World%20Impact.dc.html','Unknown%20Destination.dc.html'):content;};
assert.throws(()=>load(fs.readFileSync(file,'utf8'),injected)(base),/Design href without a config link key: Unknown/);
console.log('PASS 19 existing generator contexts byte-identical; IR-label escaping/fallback and unknown-link guard');
