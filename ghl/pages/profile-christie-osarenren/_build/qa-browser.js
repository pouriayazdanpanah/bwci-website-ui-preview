// Dev-only adapter for the existing shared QA tools; installed Chrome avoids a browser download.
const {chromium}=require('playwright');
const launch=chromium.launch.bind(chromium);
chromium.launch=opts=>launch({channel:process.env.BWCI_QA_CHANNEL||'chrome',...opts});
