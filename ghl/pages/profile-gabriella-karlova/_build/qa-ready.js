// Dev-only: wait for actual profile/data/assets/fonts, independent of unrelated network idleness.
module.exports = async function ready(page,url){
 for(let attempt=0;attempt<2;attempt++){try{
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.locator('h1').filter({hasText:'Gabriella Karlova'}).waitFor();
 await page.waitForFunction(()=>document.querySelectorAll('a.gv-card').length===2&&document.querySelectorAll('.pg-body p,.pgk-pg-body p').length===0);
 await page.waitForFunction(()=>[...document.querySelectorAll('image-slot,.pgk-slot')].length===3&&[...document.querySelectorAll('image-slot,.pgk-slot')].every(e=>{const i=e.shadowRoot?e.shadowRoot.querySelector('img'):e.querySelector('img');return i&&i.complete&&i.naturalWidth>0;}));
 await page.waitForFunction(()=>['Plus Jakarta Sans','JetBrains Mono'].every(n=>[...document.fonts].some(f=>f.family.replace(/["']/g,'')===n&&f.status==='loaded')));
 return;
 }catch(error){if(attempt===1)throw error;console.warn('QA mount incomplete; retrying once:',url);}}
};
// Static fidelity compares the fully revealed pose on both sides. Natural interaction/reveal traces
// are tested separately; async Claude mounting can leave source-only reveal tags waiting after scroll.
module.exports.staticPose=async page=>page.evaluate(()=>{
 const els=[...document.querySelectorAll('[data-bw-rv]')];
 els.forEach(e=>{e.removeAttribute('data-bw-rv');e.style.removeProperty('--bw-d');});return els.length;
});
