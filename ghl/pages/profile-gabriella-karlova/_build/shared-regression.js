// Dev-only regression: canonical Git LF design vs fresh Windows CRLF checkout, across existing chrome variants.
const fs=require('fs'),path=require('path'),cp=require('child_process'),Module=require('module'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../../../..'),file=path.join(root,'ghl/shared/site-chrome/site-chrome.js'),design=path.join(root,'design');
const baselineFs={...fs,readFileSync(f,encoding){
 if(typeof f==='string'&&f.startsWith(design+path.sep)&&encoding==='utf8'){
  const relative=path.relative(design,f).split(path.sep).join('/');
  return cp.execFileSync('git',['show','f13cda8:design/'+relative],{cwd:root,encoding:'utf8'});
 }return fs.readFileSync(f,encoding);
}};
const old=new Module(file,module);old.filename=file;old.paths=module.paths;
old.require=n=>n==='fs'?baselineFs:Module.prototype.require.call(old,n);
old._compile(cp.execFileSync('git',['show','f13cda8:ghl/shared/site-chrome/site-chrome.js'],{cwd:root,encoding:'utf8'}),file);
const current=require(file);
const cases=[['main','bw','home',null],['financial-engine','fe','engine','engine'],['ecosystem','eco','ecosystem','ecosystem'],['platforms','plt','platforms','platforms'],['smes-projects','sme','smes','smes'],['investors-partners','inv','investors','investors'],['governance','gov','governance','governance'],['governance-board','gvb','governance','gov-board'],['governance-leadership','gvl','governance','gov-leadership'],['profile-farhad-reyazat','pfr','governance','gov-profile'],['profile-alexander-alegria-saif','pas','governance','gov-profile']];
for(const [slug,prefix,section,breadcrumb] of cases){
 const opts={prefix,current:section,breadcrumb,rename:n=>prefix+'-'+n};
 if(slug==='main'){opts.system=false;opts.links={impact:'#bwci-impact',today:'#bwci-today'};}
 if(slug==='governance'){opts.govnav='hub';opts.content=true;}
 if(/governance-(board|leadership)/.test(slug)||slug.startsWith('profile-')){opts.govnav=slug.endsWith('leadership')?'leadership':'board';opts.content=true;opts.people=true;}
 if(slug.startsWith('profile-'))opts.profile={name:slug.includes('farhad')?'Dr Farhad Reyazat':'Alex Alegria-Seif',via:'board'};
 const a=old.exports(opts),b=current(opts);
 for(const key of ['header','breadcrumb','govnav','footer','runtime','links','unresolved','dynamicClasses','people'])assert.deepEqual(b[key],a[key],slug+': '+key);
 assert.equal(b.css(),a.css(),slug+': CSS');if(a.personCard)for(const p of a.people)assert.equal(b.personCard(p.slug,opts.govnav,'sm'),a.personCard(p.slug,opts.govnav,'sm'));
 console.log(slug+': identical generated chrome from LF and CRLF inputs');
}
assert(fs.readFileSync(path.join(design,'SiteHeader.dc.html'),'utf8').includes('\r\n'),'Use this regression in a fresh CRLF checkout');
