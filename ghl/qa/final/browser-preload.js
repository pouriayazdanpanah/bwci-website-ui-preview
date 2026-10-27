// Explicit local QA fixture for existing behavior tools: installed Chromium and matching fallback
// fonts. Production blocks are unchanged; this module is loaded only with node --require.
'use strict';
const {chromium}=require('playwright'),launch=chromium.launch.bind(chromium);
chromium.launch=async options=>{
 const browser=await launch({...options,channel:undefined,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:[...((options||{}).args||[]),'--no-sandbox']});
 const newPage=browser.newPage.bind(browser);
 browser.newPage=async options=>{const p=await newPage(options);await p.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\//,r=>r.abort());return p;};return browser;
};
