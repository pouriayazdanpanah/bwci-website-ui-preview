// Dev-only: wait for actual profile/data/assets/fonts, independent of unrelated network idleness.
module.exports = async function ready(page,url){
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.locator('h1').filter({hasText:'Alex Alegria-Seif'}).waitFor();
 await page.waitForFunction(()=>document.querySelectorAll('a.gv-card').length===2&&document.querySelectorAll('.pg-body p,.pas-pg-body p').length===6);
 await page.waitForFunction(()=>[...document.querySelectorAll('image-slot,.pas-slot')].length===3&&[...document.querySelectorAll('image-slot,.pas-slot')].every(e=>{const i=e.shadowRoot?e.shadowRoot.querySelector('img'):e.querySelector('img');return i&&i.complete&&i.naturalWidth>0;}));
 await page.waitForFunction(()=>['Plus Jakarta Sans','JetBrains Mono'].every(n=>[...document.fonts].some(f=>f.family.replace(/["']/g,'')===n&&f.status==='loaded')));
};
// Static fidelity compares the fully revealed pose on both sides. Natural interaction/reveal traces
// are tested separately; async Claude mounting can leave source-only reveal tags waiting after scroll.
module.exports.staticPose=async page=>page.evaluate(()=>{
 const els=[...document.querySelectorAll('[data-bw-rv]')];
 els.forEach(e=>{e.removeAttribute('data-bw-rv');e.style.removeProperty('--bw-d');});return els.length;
});
