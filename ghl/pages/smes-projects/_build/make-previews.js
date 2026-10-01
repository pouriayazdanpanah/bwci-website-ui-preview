#!/usr/bin/env node
// Dev-only: wraps the built Custom Code block in host pages that emulate a GoHighLevel page.
//   preview/plain.html   — bare host page (body margin 0), used for pixel comparison with the source
//   preview/hostile.html — host with aggressive global CSS (Bootstrap/normalize-like), a fixed-height
//                          block above the widget and a duplicate script execution, used for isolation QA
'use strict';
const fs = require('fs');
const path = require('path');
const PAGE_DIR = path.resolve(__dirname, '..');
const OUT = path.join(__dirname, 'preview');
fs.mkdirSync(OUT, { recursive: true });
const block = fs.readFileSync(path.join(PAGE_DIR, 'smes-projects.inline.ghl.html'), 'utf8');

const head = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>SMEs & Projects preview</title>';

fs.writeFileSync(path.join(OUT, 'plain.html'),
  head + '<style>body{margin:0}</style></head><body>\n' + block + '\n</body></html>\n');

const hostileCss = `
  html{font-size:10px;scroll-behavior:auto}
  body{margin:0;font-family:Georgia,serif;font-size:20px;line-height:1.1;color:#f00;text-align:center;letter-spacing:.2em}
  *{box-sizing:content-box}
  h1,h2,h3,h4,h5{font-family:Impact;font-size:50px;color:purple;margin:30px 0;text-transform:uppercase;line-height:1}
  p{margin:0 0 2em;font-size:22px}
  a{color:orange;text-decoration:underline}
  a:hover{color:red}
  ul{padding-left:40px;list-style:disc}
  li{margin-bottom:10px}
  button{font-size:100%;line-height:1.15;margin:5px;padding:10px;border:2px solid blue;background:yellow;border-radius:12px}
  img{border:5px solid lime}
  section{padding:40px;background:#eee}
  .container{width:100%;padding-right:15px;padding-left:15px;max-width:540px}
  .section{padding:99px}
  .btn{display:inline-block;font-weight:400;line-height:1.5;padding:.375rem .75rem;font-size:1rem;border-radius:.25rem}
  .footer{background:black}
  .h1{font-size:10px}
  .ghl-wrap{max-width:none;padding:0}
  .ghl-above{height:300px;background:#223;color:#fff;display:flex;align-items:center;justify-content:center}
`;
fs.writeFileSync(path.join(OUT, 'hostile.html'),
  head + '<style>' + hostileCss + '</style></head><body>\n<div class="ghl-above">GHL content above widget</div>\n<div class="ghl-wrap"><div class="c-custom-code">\n' + block +
  '\n</div></div>\n<div class="ghl-above">GHL content below widget</div>\n' +
  // simulate GHL executing the custom-code script a second time
  '<script>' + block.slice(block.lastIndexOf('<script>') + 8, block.lastIndexOf('</script>')) + '</script>\n</body></html>\n');
console.log('previews written to', OUT);
