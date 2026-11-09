// Before/after preservation check for the Start a Conversation link change (all 72 outputs).
'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const [base,repo]=process.argv.slice(2);
const files=fs.readdirSync(path.join(repo,'ghl/pages')).flatMap(d=>fs.readdirSync(path.join(repo,'ghl/pages',d)).filter(f=>f.endsWith('.ghl.html')).map(f=>path.join('ghl/pages',d,f)));
const cfgRE=/<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/;
const OLD_SECTIONS=',"startConversation":["home","#bwci-cta"]';
const report=[];
for(const f of files.sort()){
  const a=fs.readFileSync(path.join(base,f),'utf8'),b=fs.readFileSync(path.join(repo,f),'utf8');
  const ca=JSON.parse(cfgRE.exec(a)[1]),cb=JSON.parse(cfgRE.exec(b)[1]);
  const la=ca.links,lb=cb.links;delete ca.links;delete cb.links;
  assert.deepEqual(ca,cb,f+': non-link settings changed');
  assert.equal(a.match(/<style>[\s\S]*?<\/style>/g).join(''),b.match(/<style>[\s\S]*?<\/style>/g).join(''),f+': CSS changed');
  // link settings: only the expected keys come and go
  const added=Object.keys(lb).filter(k=>!(k in la)),removed=Object.keys(la).filter(k=>!(k in lb)),changed=Object.keys(lb).filter(k=>k in la&&la[k]!==lb[k]);
  assert.deepEqual(changed,[],f+': existing link values changed');
  added.forEach(k=>assert(/^startAConversation/.test(k),f+': unexpected new key '+k));
  removed.forEach(k=>assert(['startConversation','contactSurvey'].includes(k),f+': unexpected removed key '+k));
  // everything outside the config: only data-*-link values on "Start a Conversation" buttons, and the section list
  const secRE=/var sections = (\{.*?\});/;
  const sa=JSON.parse(secRE.exec(a)[1]),sb=JSON.parse(secRE.exec(b)[1]);
  const secAdded=Object.keys(sb).filter(k=>!(k in sa)),secRemoved=Object.keys(sa).filter(k=>!(k in sb));
  assert.deepEqual(secRemoved,['startConversation'],f+': section list removals');
  secAdded.forEach(k=>assert(/^startAConversation(Smes|Investors|Banks|Partners)$/.test(k)&&f.includes('/contact/'),f+': unexpected section '+k));
  Object.keys(sb).forEach(k=>{if(k in sa)assert.deepEqual(sa[k],sb[k],f+': section '+k+' changed');});
  const strip=s=>s.replace(cfgRE,'').replace(secRE,'');
  const ta=strip(a).split(/(data-[a-z]+-link="[^"]*")/),tb=strip(b).split(/(data-[a-z]+-link="[^"]*")/);
  assert.equal(ta.length,tb.length,f+': link count changed');
  const swaps={};
  for(let i=0;i<ta.length;i++){
    if(ta[i]===tb[i])continue;
    assert(i%2===1,f+': text outside link attributes changed near: '+ta[i].slice(-80));
    const after=tb[i+1].slice(0,400).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
    const isRoute=/startAConversation(Smes|Investors|Banks|Partners)/.test(tb[i]);
    assert(isRoute||/^[^"]*?>?\s*Start a Conversation/i.test(after.replace(/^[^>]*>/,'')),f+': link swap on a non-Start-a-Conversation element: '+after.slice(0,80));
    const k=ta[i].replace(/data-[a-z]+-link=/,'')+' -> '+tb[i].replace(/data-[a-z]+-link=/,'');swaps[k]=(swaps[k]||0)+1;
  }
  report.push(f.replace('ghl/pages/','')+'  +['+added+'] -['+removed+']  '+Object.entries(swaps).map(([k,v])=>v+'x '+k).join(', '));
}
console.log(report.join('\n'));console.log('PASS preservation: '+files.length+' outputs');
