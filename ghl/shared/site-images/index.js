// Development-only image mapping. Native outputs inline the resolver and need no imports.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const ref=name=>'{{ custom_values.'+name+' }}';
const definitions={
 logo:{name:'bwci_img_logo',existing:true,asset:'ghl/shared/site-chrome/assets/bwci-logo.png'},
 mainHero:{name:'hero_image',existing:true,asset:'ghl/pages/main/assets/home-hero-port.png'},
 whoPhoto:{name:'bwci_img_who_photo',existing:true,asset:'ghl/pages/main/assets/home-who-photo.webp'},
 impact1:{name:'bwci_img_impact_1',existing:true,asset:'ghl/pages/main/assets/home-impact-1.webp'},
 impact2:{name:'bwci_img_impact_2',existing:true,asset:'ghl/pages/main/assets/home-impact-2.webp'},
 impact3:{name:'bwci_img_impact_3',existing:true,asset:'ghl/pages/main/assets/home-impact-3.webp'},
 impact4:{name:'bwci_img_impact_4',existing:true,asset:'ghl/pages/main/assets/home-impact-4.webp'},
 financialEngineHero:{name:'bwci_img_financial_engine_hero',existing:false,asset:'ghl/pages/financial-engine/assets/financial-engine-hero.webp'},
 ecosystemHero:{name:'bwci_img_ecosystem_hero',existing:false,asset:'ghl/pages/ecosystem/assets/ecosystem-hero-waves.webp'},
 platformsHero:{name:'bwci_img_platforms_hero',existing:false,asset:'ghl/pages/platforms/assets/plat-hero-rails.png'},
 smesHero:{name:'bwci_img_smes_projects_hero',existing:false,asset:'ghl/pages/smes-projects/assets/sme-hero-flow.webp'},
 investorsHero:{name:'bwci_img_investors_partners_hero',existing:false,asset:'ghl/pages/investors-partners/assets/inv-hero-flow.png'},
 impactHero:{name:'bwci_img_better_world_impact_hero',existing:false,asset:'ghl/pages/better-world-impact/assets/impact-hero-ribbons.png'},
 whoWeAreHero:{name:'bwci_img_who_we_are_hero',existing:false,asset:'ghl/pages/who-we-are/assets/hero-globe.png'},
 pamHero:{name:'bwci_img_providence_asset_management_hero',existing:false,asset:'ghl/pages/providence-asset-management/assets/pam-hero.png'}
};
const portraitFiles={'alexander-alegria-saif':'jpg','farhad-reyazat':'jpg','gabriella-karlova':'webp','richard-werner':'webp','ewa-dudek':'webp','agnes-gradzewicz':'webp','christie-osarenren':'webp'};
for(const [slug,ext]of Object.entries(portraitFiles))definitions[slug]={name:'bwci_img_profile_'+slug.replace(/-/g,'_'),existing:true,asset:'ghl/pages/governance-leadership/assets/'+slug+'.'+ext};
for(const d of Object.values(definitions))d.fieldKey=ref(d.name);
const roots={logoImage:'logo',heroImage:'mainHero',financialEngineImage:'financialEngineHero',ecosystemHeroImage:'ecosystemHero',platformsHeroImage:'platformsHero',smesHeroImage:'smesHero',investorsHeroImage:'investorsHero',impactHeroImage:'impactHero',whoWeAreHeroImage:'whoWeAreHero',pamHeroImage:'pamHero'};
const main={whoPhoto:'whoPhoto',impact1:'impact1',impact2:'impact2',impact3:'impact3',impact4:'impact4',leaderAlexander:'alexander-alegria-saif',leaderFarhad:'farhad-reyazat',leaderGabriela:'gabriella-karlova'};
// The list of image settings is inlined into every page's script, so the shared part is frozen: adding a page must
// never change the pasted blocks of existing pages. A setting only one page uses (its hero) is declared by that
// page's build (site-chrome option `images`) and reaches only that page's script.
const sharedRoots=['logoImage','heroImage','financialEngineImage','ecosystemHeroImage','platformsHeroImage','smesHeroImage','investorsHeroImage','impactHeroImage'];
const pageRoots=Object.keys(roots).filter(k=>!sharedRoots.includes(k));
for(const k of sharedRoots)assert(Object.hasOwn(roots,k),'Unknown shared image setting: '+k);
const tail=[...Object.keys(main).map(k=>['images',k]),...Object.keys(portraitFiles).map(k=>['peopleImages',k])];
function pathsFor(extra){
 for(const k of extra)assert(pageRoots.includes(k),'Not a page image setting: '+k);
 return [...sharedRoots,...extra].map(k=>[k]).concat(tail);
}
// every known setting, for the build-time serialization below
const paths=pathsFor(pageRoots);
const get=(obj,parts)=>parts.reduce((o,k)=>o&&Object.hasOwn(o,k)?o[k]:undefined,obj);
function put(obj,parts,value){let o=obj;for(const k of parts.slice(0,-1))o=o[k]||(o[k]={});o[parts.at(-1)]=value;}
function entries(cfg){
 const rows=[];
 for(const parts of paths){const value=get(cfg,parts);if(value===undefined)continue;const id=parts.length===1?roots[parts[0]]:parts[0]==='images'?main[parts[1]]:parts[1];rows.push({parts,path:parts.join('.'),id,definition:definitions[id],value});}
 for(const key of Object.keys(cfg.images||{}))assert(Object.hasOwn(main,key),'Unmapped Main image: '+key);
 for(const key of Object.keys(cfg.peopleImages||{}))assert(Object.hasOwn(portraitFiles,key),'Unmapped portrait: '+key);
 return rows;
}
function forOutput(cfg){
 const output={...cfg};for(const key of ['images','peopleImages'])if(cfg[key])output[key]={...cfg[key]};
 const fallbacks=cfg.imageFallbacks?JSON.parse(JSON.stringify(cfg.imageFallbacks)):{};
 for(const row of entries(cfg)){
  if(typeof row.value==='string'&&row.value.startsWith('data:image/'))put(fallbacks,row.parts,row.value);
  put(output,row.parts,row.definition.fieldKey);
 }
 if(Object.keys(fallbacks).length)output.imageFallbacks=fallbacks;
 return output;
}
const source=fs.readFileSync(path.join(__dirname,'images.runtime.js'),'utf8');
// the resolver for one page: the shared settings plus that page's own (`extra`, from pageRoots)
const runtimeFor=(extra=[])=>source.replace('__SITE_IMAGE_PATHS__',JSON.stringify(pathsFor(extra)));
const runtime=runtimeFor([]);
module.exports={definitions,paths,sharedRoots,pageRoots,pathsFor,get,put,entries,forOutput,runtime,runtimeFor};
