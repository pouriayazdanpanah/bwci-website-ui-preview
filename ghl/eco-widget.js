(() => {
  'use strict';
  const mount = document.getElementById('bwci-ecosystem-widget');
  if (!mount || mount.shadowRoot) return;
  const template = mount.querySelector('template');
  if (!template) return;
  const root = mount.attachShadow({mode:'open'});
  root.append(template.content.cloneNode(true));
  template.remove();
  /*__ORIGINAL_CONTENT_DATA__*/
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const seqs = {full:[0,1,2,3,4],sme:[0,1,2,4],investor:[1,2,3,4],partner:[1,2,4]};
  const state = {lens:'full',step:0,playing:!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,visible:true,mech:0,part:0};
  const measure = $('.lp-measure'), nav = $('.nav'), burger = $('.nav__burger'), drawer = $('.nav__drawer');
  function menu(open) { drawer.hidden=!open; burger.setAttribute('aria-expanded',String(open)); burger.setAttribute('aria-label',open?'Close menu':'Open menu'); }
  burger.addEventListener('click',()=>menu(drawer.hidden));
  drawer.addEventListener('click',e=>{if(e.target.closest('a'))menu(false)});
  window.addEventListener('resize',()=>{if(window.innerWidth>=1024)menu(false)},{passive:true});
  root.addEventListener('click',e=>{
    const a=e.target.closest('a[href^="#"]'); if(!a)return;
    const target=root.getElementById(decodeURIComponent(a.getAttribute('href').slice(1))); if(!target)return;
    e.preventDefault(); menu(false);
    window.scrollTo({top:Math.max(0,window.scrollY+target.getBoundingClientRect().top-nav.getBoundingClientRect().height),behavior:'smooth'});
  });
  function renderLoop() {
    const seq=seqs[state.lens], item=LPN[state.step];
    $$('.lp-lens button').forEach((b,i)=>{const on=['full','sme','investor','partner'][i]===state.lens;b.classList.toggle('on',on);b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1});
    $$('.lp-node,.lp-mnode').forEach(b=>{const i=Number(b.className.match(/--(\d)/)?.[1])-1;b.classList.remove('is-on','is-dim','is-off');b.classList.add(i===state.step?'is-on':seq.includes(i)?'is-dim':'is-off');b.setAttribute('aria-pressed',String(i===state.step))});
    $$('.lp-cap__eb').forEach(x=>x.textContent=`Step ${state.step+1} of 5`);
    $$('.lp-cap__t').forEach(x=>x.textContent=item.cap[0]);
    $$('.lp-cap__b').forEach(x=>x.textContent=item.cap[1]);
    $('.lp-ring__h').textContent=state.playing?'Auto-playing':'Paused';
    $('.lp-card__who').textContent=`${String(state.step+1).padStart(2,'0')} · ${item.who}`;
    $('.lp-card > .lp-plat').hidden=state.step!==2;
    $$('.lp-prog').forEach(p=>{
      p.querySelectorAll('.lp-prog__d').forEach(b=>b.remove());
      const hint=p.querySelector('.lp-prog__hint');
      seq.forEach(i=>{const b=document.createElement('button');b.type='button';b.className='lp-prog__d'+(i===state.step?' on':'');b.setAttribute('aria-label',`Go to step ${i+1}`);b.dataset.step=i;hint.before(b)});
      p.hidden=!state.playing;
    });
    $$('.lp-play').forEach(b=>b.hidden=state.playing);
  }
  function pick(i) {state.step=i;state.playing=false;renderLoop()}
  $$('.lp-lens button').forEach((b,i)=>b.addEventListener('click',()=>{state.lens=['full','sme','investor','partner'][i];state.step=seqs[state.lens][0];state.playing=!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;renderLoop()}));
  root.addEventListener('click',e=>{
    const n=e.target.closest('.lp-node,.lp-mnode');if(n)return pick(Number(n.className.match(/--(\d)/)?.[1])-1);
    const d=e.target.closest('.lp-prog__d');if(d)return pick(Number(d.dataset.step));
    if(e.target.closest('.lp-play')){state.playing=true;renderLoop()}
  });
  const timer=setInterval(()=>{if(!mount.isConnected){clearInterval(timer);return}if(!state.playing||!state.visible)return;const seq=seqs[state.lens];state.step=seq[(seq.indexOf(state.step)+1)%seq.length];renderLoop()},4000);
  if('IntersectionObserver' in window){
    new IntersectionObserver(es=>state.visible=es[0].isIntersecting,{threshold:.15}).observe($('#blueprint'));
    const reveal=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('rv-in');reveal.unobserve(x.target)}}),{threshold:.15});
    $$('.rv').forEach(x=>reveal.observe(x));
  }else $$('.rv').forEach(x=>x.classList.add('rv-in'));
  function sizeLoop(){const w=measure.clientWidth,wide=w>=900;$('.lp-stage').hidden=!wide;$('.lp-mob').hidden=wide;if(wide){const s=Math.min(1,w/1120);$('.lp-stage').style.height=`${Math.round(740*s)}px`;$('.lp-canvas').style.transform=`translateX(-50%) scale(${s})`}}
  sizeLoop();if('ResizeObserver' in window)new ResizeObserver(sizeLoop).observe(measure);else window.addEventListener('resize',sizeLoop,{passive:true});
  renderLoop();
  function mechanism(i){if(state.mech===i)return;state.mech=i;$$('.cm-item').forEach((x,n)=>x.classList.toggle('cm-item--on',n===i));$('.cm-diagram').dataset.mech=i}
  $$('.cm-item').forEach((x,i)=>['click','mouseenter','focus'].forEach(t=>x.addEventListener(t,()=>mechanism(i))));
  function participant(i){
    if(state.part===i)return;state.part=i;
    $$('.pt-node').forEach((x,n)=>{x.classList.toggle('pt-node--on',n===i);x.setAttribute('aria-pressed',String(n===i))});
    $$('.pt-spoke').forEach((x,n)=>x.classList.toggle('pt-spoke--on',n===i));
    $$('.pt-port').forEach((x,n)=>x.classList.toggle('pt-port--on',n===i));
    const p=PARTS[i],panel=$('.pt-panel');
    panel.querySelector('.pt-panel__c').textContent=p.code;panel.querySelector('.pt-panel__t').textContent=p.title;
    const rel=panel.querySelector('.pt-rel');rel.textContent=p.rel;rel.classList.toggle('pt-rel--partner',!!p.partner);
    panel.querySelector('.pt-fields').replaceChildren(...p.fields.map(([l,v])=>{const d=document.createElement('div'),a=document.createElement('span'),b=document.createElement('p');d.className='pt-f';a.className='pt-f__l';a.textContent=l;b.className='pt-f__t';b.textContent=v;d.append(a,b);return d}));
    panel.replaceWith(panel.cloneNode(true));
  }
  $$('.pt-node').forEach((x,i)=>['click','mouseenter','focus'].forEach(t=>x.addEventListener(t,()=>participant(i))));
})();
