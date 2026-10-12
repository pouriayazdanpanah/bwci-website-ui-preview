(function(){
 class DCLogic{constructor(){this.props={};this.state={};} setState(s){Object.assign(this.state,s);}}
 window.DCLogic=DCLogic;
 function strip(e){return e.trim().replace(/^\{\{/,'').replace(/\}\}$/,'').trim();}
 function get(scope,expr){ try{ return Function(...Object.keys(scope),'return ('+expr+')')(...Object.values(scope)); }catch(e){ return undefined; } }
 function interp(str,scope){ return str.replace(/\{\{([\s\S]+?)\}\}/g,(m,e)=>{const v=get(scope,e.trim()); return (v===undefined||v===null||typeof v==='function')?'':String(v);}); }
 function proc(node,scope){
   for (const child of Array.from(node.childNodes)){
     if(child.nodeType===3){ if(child.nodeValue.includes('{{')) child.nodeValue=interp(child.nodeValue,scope); continue;}
     if(child.nodeType!==1) continue;
     const tag=child.tagName.toLowerCase();
     if(tag==='sc-for'){ const list=get(scope,strip(child.getAttribute('list')))||[]; const as=child.getAttribute('as'); const frag=document.createDocumentFragment();
       list.forEach((item,i)=>{ const wrap=document.createElement('div'); wrap.innerHTML=child.innerHTML; proc(wrap,Object.assign({},scope,{[as]:item,index:i})); while(wrap.firstChild) frag.appendChild(wrap.firstChild);});
       child.replaceWith(frag); continue;}
     if(tag==='sc-if'){ const v=get(scope,strip(child.getAttribute('value'))); if(v){ proc(child,scope); const frag=document.createDocumentFragment(); while(child.firstChild) frag.appendChild(child.firstChild); child.replaceWith(frag);} else child.remove(); continue;}
     for(const a of Array.from(child.attributes)){ if(a.value.includes('{{')){ if(a.name.toLowerCase().startsWith('on')) child.removeAttribute(a.name); else child.setAttribute(a.name,interp(a.value,scope)); } }
     proc(child,scope);
   }
 }
 document.addEventListener('DOMContentLoaded',()=>{
   const sc=document.querySelector('script[data-dc-script]'); let vals={};
   if(sc){ try{ const C=Function('DCLogic',sc.textContent+'; return Component;')(DCLogic); const inst=new C(); vals=inst.renderVals?inst.renderVals():{}; }catch(e){console.error('dc',e);} }
   window.__WANT_NOTES = window.__WANT_NOTES ?? false;
   if('showNotes' in vals) vals.showNotes = window.__WANT_NOTES;
   const x=document.querySelector('x-dc'); const h=x.querySelector('helmet'); if(h){ Array.from(h.childNodes).forEach(n=>document.head.appendChild(n)); h.remove(); }
   proc(x,vals); document.body.setAttribute('data-ready','1');
 });
})();
