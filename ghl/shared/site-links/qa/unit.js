#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),links=require('..');
const shared=fs.readFileSync(path.join(__dirname,'../../site-chrome/site-chrome.runtime.js'),'utf8');
const availability=shared.slice(shared.indexOf('  function siteLinkAvailable'),shared.indexOf('  function siteLink(a'));
const ctx={ROOT_ID:'bwci-test'};vm.createContext(ctx);vm.runInContext(availability+'\n'+links.runtime,ctx);
let checks=0;const check=(label,fn)=>{fn();checks++;console.log('PASS '+label);};
function resolve(values,root='bwci-test'){ctx.ROOT_ID=root;const cfg={links:{...values},logoImage:'unchanged',showHeader:false};ctx.siteResolveLinks(cfg);assert.equal(cfg.logoImage,'unchanged');assert.equal(cfg.showHeader,false);return cfg.links;}
for(const [key,[base,fragment]]of Object.entries(links.sections)){
 for(const value of ['#','','  ',links.fieldFor(base).fieldKey,'javascript:alert(1)','//wrong.test'])check(key+' safely disabled for '+JSON.stringify(value),()=>{
  const r=resolve({[base]:value,[key]:value+fragment});assert.equal(r[key],'#');assert.equal(r[base],'#');
 });
 for(const value of ['/real-page?x=1&y=2','https://example.test/real-page?x=a%2Cb&y=2#previous'])check(key+' preserves query and composes real fragment',()=>{
  const r=resolve({[base]:value,[key]:value+fragment});assert.equal(r[key],value.split('#')[0]+fragment);
 });
 check(key+' explicit override is preserved',()=>{const r=resolve({[base]:'/real-page',[key]:'https://other.test/custom#custom'});assert.equal(r[key],'https://other.test/custom#custom');});
}
check('Main local impact/today work with unavailable page URL',()=>{const r=resolve({home:'#',impact:'#bwci-impact',today:'#bwci-today'},'bwci-main-page');assert.equal(r.impact,'#bwci-impact');assert.equal(r.today,'#bwci-today');});
check('unresolved token inside an otherwise valid URL is disabled',()=>{assert.equal(resolve({contact:'https://example.test/'+links.fieldFor('contact').fieldKey}).contact,'#');});
check('mailto, tel, external and local anchors remain usable',()=>{const values={a:'mailto:ir@example.test',b:'tel:+440000000000',c:'https://www.fca.org.uk/example',d:'#local'};assert.deepEqual(resolve(values),values);});
check('empty/non-string input values are unavailable',()=>{const r=resolve({a:null,b:4,c:false,d:[],e:{}});assert(Object.values(r).every(v=>v==='#'));});
check('exact returned fieldKey spelling is retained in JSON',()=>{assert.equal(links.reference('home','governance'),'{{ custom_values.bwci_url_home }}');});
check('named existing values keep their exact key and take no section',()=>{for(const [k,name] of Object.entries(links.named)){assert.equal(links.reference(k,'contact'),links.fields.get(name).fieldKey);assert(!Object.hasOwn(links.destinations,k)&&!Object.hasOwn(links.proposed,k));}assert.equal(links.reference('contactSurvey','contact'),'{{ custom_values.contact }}');assert.notEqual(links.reference('contactSurvey','contact'),links.reference('contact','contact'));});
check('proposed values follow bwci_url_ naming and do not exist yet',()=>{for(const [k,v] of Object.entries(links.proposed)){const f=links.fieldFor(k);assert.equal(f.name,'bwci_url_'+v);assert(f.proposed&&!links.fields.has(f.name));}});
const out=path.join(__dirname,'output');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'unit.json'),JSON.stringify({status:'PASS',checks},null,2)+'\n');console.log('PASS '+checks+' navigation boundary checks');
