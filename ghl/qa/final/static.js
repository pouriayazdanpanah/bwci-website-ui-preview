#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),crypto=require('node:crypto'),{createRequire}=require('node:module');
const {fs,path,repo,pages,out,manifest,block}=require('./common');
const rows=manifest(),report={date:new Date().toISOString(),baseline:'7ddc04f85fed7fc457d5d25fc2d42e834d15807f',status:'PASS',pages:[],guards:[]};assert.equal(rows.length,23);
const identities=new Map();
const hashes=new Set();for(const dir of [path.join(repo,'ghl/shared/site-chrome/assets'),...rows.map(r=>path.join(pages,r.slug,'assets'))])if(fs.existsSync(dir))for(const f of fs.readdirSync(dir)){const p=path.join(dir,f);if(fs.statSync(p).isFile())hashes.add(crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'));}
function images(v){if(typeof v==='string'&&v.startsWith('data:image/')){const m=v.match(/^data:([^;]+);base64,(.*)$/s);assert(m,'Encoded config image');assert(hashes.has(crypto.createHash('sha256').update(Buffer.from(m[2],'base64')).digest('hex')),'Config image matches supplied page/shared asset');return 1;}if(Array.isArray(v))return v.reduce((s,x)=>s+images(x),0);if(v&&typeof v==='object')return Object.values(v).reduce((s,x)=>s+images(x),0);return 0;}
for(const row of rows){const hosted=block(row.slug,'hosted'),inline=block(row.slug,'inline');assert.equal(hosted.slice(hosted.indexOf('<link')),inline.slice(inline.indexOf('<link')),row.slug+' variants markup/style/runtime');new vm.Script(row.runtime);
 const body=inline.slice(inline.indexOf('<div id='),inline.lastIndexOf('<script>')),ids=[...body.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,row.slug+' unique ids');assert.equal((body.match(/<h1\b/g)||[]).length,1);assert((body.match(/<main\b/g)||[]).length<=1,row.slug+' at most one main landmark');
 for(const m of body.matchAll(new RegExp('data-'+row.prefix+'-link="([^\"]+)"','g')))assert(Object.hasOwn(row.cfg.links,m[1]),row.slug+' config key '+m[1]);
 for(const m of body.matchAll(/href="#([^"]+)"/g))assert(ids.includes(m[1]),row.slug+' local anchor '+m[1]);
 const code=row.runtime.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');assert(!/\.dc\.html|support\.js|React\.|localhost|unpkg\.com|file:\/\//.test(code));assert(!/href="[^\"]*\.dc\.html|src="(?:\.\/)?assets\//.test(body));
 assert.equal(row.cfg.links.betterWorldImpact,'#');if(row.cfg.links.impact)assert.equal(row.cfg.links.impact,row.slug==='main'?'#bwci-impact':'/#bwci-impact');
 identities.set(row.slug,new Set(ids));
 report.pages.push({slug:row.slug,root:row.root,prefix:row.prefix,owner:row.owner,source:row.source,hash:row.hash,status:'PASS',ids:ids.length,embeddedAssetValues:images(row.cfg)});
 if(row.slug!=='main'){
  const dir=path.join(pages,row.slug,'_build'),file=path.join(dir,'build.js'),cfgfile=path.join(dir,'src',row.slug+'.config.json');
  function fixture(mutator){const cfg=JSON.parse(fs.readFileSync(cfgfile,'utf8'));mutator(cfg);const mem=Object.create(fs);mem.readFileSync=(f,e)=>String(f)===cfgfile?JSON.stringify(cfg):fs.readFileSync(f,e);mem.writeFileSync=()=>{};const fn=vm.runInThisContext('(function(require,__dirname,process,console){'+fs.readFileSync(file,'utf8').replace(/^#![^\n]*\n/,'')+'\n})');fn(n=>n==='fs'?mem:createRequire(file)(n),dir,{argv:[]},{log(){}});}
  assert.throws(()=>fixture(c=>{delete c.links.betterWorldImpact;}),/Link key missing/);assert.throws(()=>fixture(c=>{c.links.unusedFinalFixture='#';}),/Unused link key/);report.guards.push({slug:row.slug,status:'PASS',checks:['missing key','unknown unused key']});
 }
}
for(const row of rows)for(const url of Object.values(row.cfg.links)){if(typeof url!=='string'||!url.startsWith('/'))continue;const target=new URL(url,'https://local.bwci.qa'),slug=target.pathname==='/'?'main':target.pathname.replace(/^\/|\/$/g,'');if(target.hash&&identities.has(slug))assert(identities.get(slug).has(decodeURIComponent(target.hash.slice(1))),row.slug+' cross-page anchor '+url);}
const chromeFile=path.join(repo,'ghl/shared/site-chrome/site-chrome.js'),injected=Object.create(fs),mod={exports:{}};injected.readFileSync=(f,e)=>{const s=fs.readFileSync(f,e);return String(f).endsWith('SiteHeader.dc.html')?s.replace('Better%20World%20Impact.dc.html','UnknownFinal.dc.html'):s;};vm.runInThisContext('(function(require,module,exports,__dirname){'+fs.readFileSync(chromeFile,'utf8')+'\n})')(n=>n==='fs'?injected:createRequire(chromeFile)(n),mod,mod.exports,path.dirname(chromeFile));assert.throws(()=>mod.exports({prefix:'fixture',current:'home',system:false}),/Design href without a config link key/);report.unknownDesignHrefGuard='PASS';report.crossPageAnchors='PASS';
assert.equal(new Set(rows.map(r=>r.root)).size,23);assert.equal(new Set(rows.map(r=>r.owner)).size,23);assert.equal(new Set(rows.map(r=>r.prefix)).size,23);
fs.writeFileSync(path.join(out,'static.json'),JSON.stringify(report,null,2)+'\n');console.log('PASS final static: 23 pages, 46 native variants, original embedded assets, anchors, routes, isolated identities, 44 guard fixtures');
