// Development-only mapping. Exact fieldKey strings come from the user's existing GHL export.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const snapshot=require('./custom-values.snapshot.json');
const fields=new Map(),keys=new Set();
for(const field of snapshot.customValues){
 assert(!fields.has(field.name),'Duplicate Custom Value name: '+field.name);
 const match=/^\{\{\s*custom_values\.([a-z0-9_]+)\s*\}\}$/.exec(field.fieldKey);
 assert(match,'Invalid fieldKey: '+field.fieldKey);assert(!keys.has(match[1]),'Duplicate fieldKey: '+match[1]);
 assert.equal(typeof field.value,'string');keys.add(match[1]);fields.set(field.name,field);
}
const destinations={
 home:'home',whoWeAre:'who_we_are',financialEngine:'financial_engine',ecosystem:'ecosystem',
 platforms:'platforms',smes:'smes_projects',investors:'investors_partners',privateInvestors:'private_investors',
 governance:'governance',governanceBoard:'governance_board',leadership:'governance_leadership',
 profileAlexanderAlegriaSaif:'profile_alexander_alegria_saif',profileFarhadReyazat:'profile_farhad_reyazat',
 profileGabriellaKarlova:'profile_gabriella_karlova',profileRichardWerner:'profile_richard_werner',
 profileEwaDudek:'profile_ewa_dudek',profileAgnesGradzewicz:'profile_agnes_gradzewicz',
 profileChristieOsarenren:'profile_christie_osarenren',corporateIR:'corporate_ir',
 corporateIRCompanyInformation:'corporate_ir_company_information',corporateIRReportsDocuments:'corporate_ir_reports_documents',
 corporateIRShareholders:'corporate_ir_shareholders',corporateIRRegulatory:'corporate_ir_regulatory',
 corporateIRLegalNotices:'corporate_ir_legal_notices',betterWorldImpact:'better_world_impact',
 contact:'contact',verify:'verify',announcements:'announcements',legalPrivacy:'privacy_policy',legalTerms:'terms',
 legalCookies:'cookies_policy',legalDisclosures:'disclosures',legalAccessibility:'accessibility',legalSitemap:'sitemap',
 legalComplaints:'complaints_policy',legalModernSlavery:'modern_slavery',fcaRegisterEntry:'fca_register_entry',
 verifyEmail:'verify_email',verifyPhone:'verify_phone',irEmail:'ir_email',secretaryEmail:'secretary_email',
 shareholderMeetingNotice:'shareholder_meeting_notice',shareholderMeetingResults:'shareholder_meeting_results'
};
const sections={
 whoPurpose:['whoWeAre','#purpose'],whoRole:['whoWeAre','#role'],whoPrinciples:['whoWeAre','#principles'],whoStory:['whoWeAre','#story'],
 governanceFramework:['governance','#gov-framework'],governanceCommittees:['governance','#gov-committees'],
 governanceCapital:['governance','#gov-capital'],governanceRisk:['governance','#gov-risk'],governancePerimeter:['governance','#gov-perimeter'],
 impact:['home','#bwci-impact'],today:['home','#bwci-today'],explorePlatforms:['home','#bwci-platforms'],startConversation:['home','#bwci-cta'],
 financialEngineHero:['financialEngine','#fe-hero'],ecosystemBlueprint:['ecosystem','#eco-blueprint'],
 platformsDirectory:['platforms','#plt-directory'],platformsRegisters:['platforms','#plt-registers'],
 investorsEngage:['investors','#inv-engage'],investorsParticipation:['investors','#inv-participation'],investorsRoute:['investors','#inv-route'],
 smesEngage:['smes','#sme-engage'],smesProcess:['smes','#sme-process'],smesSituation:['smes','#sme-situation']
};
// Destinations a page links to that have no Custom Value in the supplied export yet. Their names follow
// bwci_url_<destination>; the owner creates them (the merge field stays literal, so the link stays
// unavailable, until then). Listed separately so the export-backed inventory above is unchanged.
const proposed={ourRole:'our_role'};
function fieldFor(key){
 const base=sections[key]?sections[key][0]:key;
 if(Object.hasOwn(proposed,base)){const name='bwci_url_'+proposed[base];assert(!fields.has(name),'Proposed value already exists: '+name);return {name,fieldKey:'{{ custom_values.'+name+' }}',value:'#',proposed:true};}
 assert(Object.hasOwn(destinations,base),'Unmapped link property: '+key);
 const field=fields.get('bwci_url_'+destinations[base]);assert(field,'Missing existing Custom Value for '+key);return field;
}
function local(key,slug){return slug==='main'&&(key==='impact'||key==='today');}
function reference(key,slug){return local(key,slug)?sections[key][1]:fieldFor(key).fieldKey+(sections[key]?sections[key][1]:'');}
Object.keys(destinations).forEach(fieldFor);
const runtime=fs.readFileSync(path.join(__dirname,'links.runtime.js'),'utf8').replace('__SITE_LINK_SECTIONS__',JSON.stringify(sections));
module.exports={snapshot,fields,destinations,proposed,sections,fieldFor,local,reference,runtime};
