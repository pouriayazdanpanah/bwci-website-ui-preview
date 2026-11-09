// Browser check: every "Start a Conversation" link opens the Start a Conversation page; "Contact" keeps the Contact page.
'use strict';
const fs=require('fs'),path=require('path'),{chromium}=require('playwright');
const repo=process.argv[2],tmp=process.argv[3];fs.mkdirSync(tmp,{recursive:true});
const files=fs.readdirSync(path.join(repo,'ghl/pages')).flatMap(d=>fs.readdirSync(path.join(repo,'ghl/pages',d)).filter(f=>f.endsWith('.ghl.html')).map(f=>path.join('ghl/pages',d,f))).sort();
const START='https://site.test/bwci_url_start_a_conversation',CONTACT='https://site.test/bwci_url_contact';
// GHL substitution model: link values become test URLs; image values stay literal (unset)
const sub=(s,overrides={})=>s.replace(/\{\{\s*custom_values\.([a-z0-9_]+)\s*\}\}/g,(m,k)=>k in overrides?overrides[k]:(/^bwci_img_|^hero_image$/.test(k)?m:'https://site.test/'+k));
(async()=>{
  const browser=await chromium.launch();const rows=[];let fail=0;
  async function load(f,overrides){
    const html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><p>Host content above</p>'+sub(fs.readFileSync(path.join(repo,f),'utf8'),overrides)+'<p>Host content below</p></body></html>';
    const out=path.join(tmp,f.replace(/\//g,'__'));fs.writeFileSync(out,html);
    const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];
    page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error'&&!/ERR_|Failed to load resource/.test(m.text()))errors.push(m.text());});
    await page.route('**/*',r=>r.request().url().startsWith('file:')?r.continue():r.abort());
    await page.goto('file://'+out);await page.waitForTimeout(700);
    const links=await page.evaluate(()=>[...document.querySelectorAll('a')].map(a=>({t:a.textContent.replace(/\s+/g,' ').trim(),href:a.getAttribute('href'),key:[...a.attributes].map(x=>/^data-[a-z]+-link$/.test(x.name)?x.value:'').join(''),off:a.getAttribute('aria-disabled')})));
    await page.close();return {links,errors};
  }
  for(const f of files){
    const {links,errors}=await load(f,{});const bad=[];
    const sac=links.filter(l=>/start a conversation/i.test(l.t)||/^startAConversation/.test(l.key));
    for(const l of sac){
      const route=/^startAConversation(Smes|Investors|Banks|Partners)$/.exec(l.key);
      const want=route?START+'#'+route[1].toLowerCase():(l.key?START:null);
      if(want&&l.href!==want)bad.push('SaC '+JSON.stringify(l.t.slice(0,30))+' '+l.key+' -> '+l.href);
      if(!want&&!/^#(inv|sme)-engage$/.test(l.href))bad.push('SaC without key: '+l.href);
    }
    links.filter(l=>l.t==='Contact').forEach(l=>{if(l.href!==CONTACT)bad.push('Contact -> '+l.href);});
    links.filter(l=>/site\.test\/contact(\b|$)/.test(l.href||'')).forEach(l=>bad.push('survey link remains: '+l.t));
    if(errors.length)bad.push('errors: '+errors.join(' | '));
    const n=sac.filter(l=>l.href&&l.href.startsWith(START)).length,local=sac.filter(l=>/^#/.test(l.href)).length;
    rows.push((bad.length?'FAIL ':'PASS ')+f.replace('ghl/pages/','')+'  start-a-conversation links: '+n+(local?' (+'+local+' same-page jump)':'')+'  contact links: '+links.filter(l=>l.t==='Contact').length+(bad.length?'\n   '+bad.join('\n   '):''));
    if(bad.length)fail++;
  }
  // unset value: buttons stay unavailable, "Contact" unaffected
  for(const f of ['ghl/pages/contact/contact.ghl.html','ghl/pages/governance/governance.inline.ghl.html','ghl/pages/main/main.ghl.html']){
    const {links}=await load(f,{bwci_url_start_a_conversation:'#'});
    const sac=links.filter(l=>/^startAConversation/.test(l.key));
    const ok=sac.length&&sac.every(l=>l.href==='#'&&l.off==='true')&&links.filter(l=>l.t==='Contact').every(l=>l.href===CONTACT);
    rows.push((ok?'PASS ':'FAIL ')+'unset value '+f.replace('ghl/pages/','')+': '+sac.length+' buttons disabled, Contact still live');if(!ok)fail++;
  }
  await browser.close();console.log(rows.join('\n'));console.log(fail?'FAILURES: '+fail:'PASS all '+files.length+' outputs + unset-value checks');process.exit(fail?1:0);
})();
