'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const chrome = require('../../ghl/shared/site-chrome/site-chrome');
const footerPath = path.resolve(__dirname, '../../design/SiteFooter.dc.html');
const source = fs.readFileSync(footerPath, 'utf8');
const routes = {Privacy:'privacy',Terms:'terms',Cookies:'cookies',Disclosures:'disclosures',Accessibility:'accessibility'};
let legacy = source;
for (const [page, fragment] of Object.entries(routes)) legacy = legacy.replaceAll(page+'.dc.html', 'Legal.dc.html#'+fragment);
let updated = legacy;
for (const [page, fragment] of Object.entries(routes)) updated = updated.replaceAll('Legal.dc.html#'+fragment, page+'.dc.html');
function render(footer) {
  const read = fs.readFileSync;
  fs.readFileSync = function(file, ...args) {return String(file)===footerPath ? footer : read.call(this,file,...args);};
  try {return chrome({prefix:'qa',current:'home',breadcrumb:null,system:false}).footer;}
  finally {fs.readFileSync=read;}
}
assert.equal(render(updated),render(legacy),'New design routes must retain existing GHL config keys and markup');
assert.throws(()=>render(updated.replace('Privacy.dc.html','Unmapped Policy.dc.html')),/Design href without a config link key/);
console.log('PASS: five standalone policy routes preserve footer output; unknown routes still fail');
