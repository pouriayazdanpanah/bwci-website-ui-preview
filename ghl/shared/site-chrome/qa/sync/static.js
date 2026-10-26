#!/usr/bin/env node
// Current synchronization invariants; baseline outputs are exported from merged main before editing.
'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),{createRequire}=require('node:module');
const {fs,path,repo,pages,out,parse,manifest,block}=require('./common');
const baseline=process.argv[2];if(!baseline)throw Error('Pass a directory of <slug>/<slug>[.inline].ghl.html baseline files.');
const rows=manifest();assert.equal(rows.length,23);const results=[];
const main=h=>{const body=h.slice(h.indexOf('<div id='),h.lastIndexOf('<script>'));return body.slice(body.indexOf('<section'),body.lastIndexOf('</section>')+10);};const style=h=>h.match(/<style>([\s\S]*?)<\/style>/)[1];
const stripCTA=s=>s.replace(/#bwci-main-page \.bw-cta(?:::before)?\{[^}]+\}\n?/g,'');
for(const row of rows){
 const hosted=block(row.slug,'hosted'),inline=block(row.slug,'inline');
 assert.equal(hosted.slice(hosted.indexOf('<link')),inline.slice(inline.indexOf('<link')),row.slug+' variants differ only before font links (config/image values)');
 for(const variant of ['hosted','inline']){
  const before=block(row.slug,variant,baseline),after=block(row.slug,variant),a=parse(before),b=parse(after);
  assert.deepEqual(b.cfg,{...a.cfg,links:{...a.cfg.links,betterWorldImpact:'#'}},row.slug+' config/images');
  assert.equal(main(after),main(before),row.slug+' page content');
  if(row.slug==='main')assert.equal(stripCTA(style(after)),stripCTA(style(before)),'Only confirmed Main CTA CSS changes');
  else assert.equal(style(after),style(before),row.slug+' styles unchanged');
  new vm.Script(b.runtime);assert.equal(b.root,a.root);assert.equal(b.owner,a.owner);assert.equal(b.prefix,a.prefix);
  assert.equal((after.match(new RegExp('data-'+b.prefix+'-link="betterWorldImpact"','g'))||[]).length,3,row.slug+' independent links');
  assert.equal((after.slice(after.indexOf('<div'),after.lastIndexOf('<script>')).match(new RegExp('data-'+b.prefix+'-link="impact"','g'))||[]).length,0);
  assert(!/\.dc\.html|support\.js|React\./.test(b.runtime.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'')),row.slug+' no source runtime');
  results.push({slug:row.slug,variant,status:'PASS',legacyImpact:b.cfg.links.impact??null});
 }
}
// Keep both guards. The only retained inactive link setting is the explicitly named legacy impact key.
for(const row of rows.filter(r=>r.slug!=='main')){
 const dir=path.join(pages,row.slug,'_build'),file=path.join(dir,'build.js'),config=path.join(dir,'src',row.slug+'.config.json');
 function run(mutator){const c=JSON.parse(fs.readFileSync(config,'utf8'));mutator(c);const mem=Object.create(fs);mem.readFileSync=(f,e)=>String(f)===config?JSON.stringify(c):fs.readFileSync(f,e);mem.writeFileSync=()=>{};
  const build=vm.runInThisContext('(function(require,__dirname,process,console){'+fs.readFileSync(file,'utf8').replace(/^#![^\n]*\n/,'')+'\n})');
  build(n=>n==='fs'?mem:createRequire(file)(n),dir,{argv:[]},{log(){}});
 }
 assert.throws(()=>run(c=>{delete c.links.betterWorldImpact;}),/Link key missing/,row.slug+' missing guard');
 assert.throws(()=>run(c=>{c.links.unusedSyncFixture='#';}),/Unused link key/,row.slug+' unused guard');
}
const chromeFile=path.join(repo,'ghl/shared/site-chrome/site-chrome.js'),source=fs.readFileSync(chromeFile,'utf8'),mod={exports:{}},mem=Object.create(fs);
mem.readFileSync=(f,e)=>{const s=fs.readFileSync(f,e);return String(f).endsWith('SiteHeader.dc.html')?s.replace('Better%20World%20Impact.dc.html','UnknownSyncDestination.dc.html'):s;};
vm.runInThisContext('(function(require,module,exports,__dirname){'+source+'\n})')(n=>n==='fs'?mem:require(n),mod,mod.exports,path.dirname(chromeFile));
assert.throws(()=>mod.exports({prefix:'fixture',current:'home',system:false}),/Design href without a config link key/);
const chrome=require(chromeFile);assert.equal(chrome.HREF_KEYS['Main.dc.html#impact'],'impact');assert.equal(chrome.LINK_DEFAULTS.impact,'/#bwci-impact');assert.equal(chrome.HREF_KEYS['Better%20World%20Impact.dc.html'],'betterWorldImpact');
const mainChrome=chrome({prefix:'bw',current:'home',breadcrumb:null,system:false,links:{impact:'#bwci-impact',today:'#bwci-today'}});
for(const v of ['hosted','inline'])for(const k of ['header','footer','runtime'])assert(block('main',v).includes(mainChrome[k]),'Main includes exact generated '+k);
fs.writeFileSync(path.join(out,'static.json'),JSON.stringify({date:new Date().toISOString(),status:'PASS',pages:rows.map(({slug,root,config,owner,prefix})=>({slug,root,config,owner,prefix})),checks:results,guards:'22 missing-key and unused-key fixtures plus unknown design href guard PASS'},null,2)+'\n');
console.log('PASS 46 outputs: configs/images/legacy URLs, page content, scoped styles, JS syntax; missing/unused/unknown guards retained');
