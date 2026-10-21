// Dev-only: prove opt-in profile support does not change existing page builds.
const fs=require('fs'),path=require('path'),cp=require('child_process'),Module=require('module'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../../../..');
const file=path.join(root,'ghl/shared/site-chrome/site-chrome.js');
const old=new Module(file,module);old.filename=file;old.paths=module.paths;
old._compile(cp.execFileSync('git',['show','05e32a1:ghl/shared/site-chrome/site-chrome.js'],{cwd:root,encoding:'utf8'}),file);
const current=require(file);
const cases=[['main','bw','home',null],['financial-engine','fe','engine','engine'],['ecosystem','eco','ecosystem','ecosystem'],
 ['platforms','plt','platforms','platforms'],['smes-projects','sme','smes','smes'],['investors-partners','inv','investors','investors'],
 ['governance','gov','governance','governance'],['governance-board','gvb','governance','gov-board'],['governance-leadership','gvl','governance','gov-leadership']];
for(const [slug,prefix,section,breadcrumb] of cases){
 const opts={prefix,current:section,breadcrumb,rename:n=>prefix+'-'+n};
 if(slug==='main'){opts.system=false;opts.links={impact:'#bwci-impact',today:'#bwci-today'};}
 if(slug==='governance'){opts.govnav='hub';opts.content=true;}
 if(slug==='governance-board'||slug==='governance-leadership'){opts.govnav=slug.endsWith('board')?'board':'leadership';opts.content=true;opts.people=true;}
 const a=old.exports(opts),b=current(opts);
 for(const key of ['header','breadcrumb','govnav','footer','runtime','links','unresolved','dynamicClasses','logoPath','people'])assert.deepEqual(b[key],a[key],slug+': '+key);
 assert.equal(b.css(),a.css(),slug+': CSS');
 if(a.personCard)for(const p of a.people)assert.equal(b.personCard(p.slug,opts.govnav,'sm'),a.personCard(p.slug,opts.govnav,'sm'));
 console.log(slug+': generated chrome, CSS, runtime, routes and cards unchanged');
}
