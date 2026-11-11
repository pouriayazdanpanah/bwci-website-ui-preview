// Dev-only: the QA reference for this port. The page follows the layout of design/Who We Are.dc.html (export 505e162)
// with the owner's text from the live GoHighLevel page (supplied 11 November 2026). This module applies that text to
// the design source in memory (the design file itself is not edited) so the port can be compared with it:
//   page()   → the design page with the owner's text
//   people() → design/bwci-people.js with this page's card names and roles
// qa-routes.js serves both when MERGED=1 is set, at design/Who We Are (merged).dc.html.
'use strict';
const fs = require('fs');
const path = require('path');
const DESIGN = path.resolve(__dirname, '../../../../design');
const MERGED_NAME = 'Who We Are (merged).dc.html';

function apply(src, pairs, label) {
  let s = src;
  pairs.forEach(([a, b]) => {
    const n = s.split(a).length - 1;
    if (n !== 1) throw new Error(label + ': expected one match, found ' + n + ': ' + a.slice(0, 80));
    s = s.replace(a, () => b);
  });
  return s;
}

// [design text, owner's live text]
const PAGE = [
  ['<img src="./assets/hero-globe.png" alt=""', '<img src="./assets/hero-globe.png" alt="People at work on the production floor of a manufacturing business"'],
  ['<p class="body-lg">Better World Capital Investments PLC is developing an integrated financial platform connecting capital, institutions and financial capability with productive businesses and projects.</p>',
    '<p class="body-lg">Better World Capital Investments PLC exists so that finance follows the needs of the real economy. We design the financial architecture that lets capital, institutions and partners support productive businesses and projects.</p>'],
  ['<a class="hero-btn hero-btn--solid" href="#role">Our role <span aria-hidden="true">↓</span></a>', '<a class="hero-btn hero-btn--solid" href="Our%20Role.dc.html">Our role <span aria-hidden="true">→</span></a>'],
  ['<span class="gl-t gl-t--ph">[Registered office]</span>', '<span class="gl-t">Registered office Address<br> 3 More London Riverside, London, SE1 2RE, United Kingdom</span>'],
  ['\n              <a class="link" href="Corporate%20IR.dc.html#regulatory">Regulatory information <span class="ar" aria-hidden="true">→</span></a>', ''],
  ['<h2 class="h1 pu-h">Reconnecting capital with the real economy.</h2>', '<h2 class="h1 pu-h">Why BWCI exists</h2>'],
  ['<p>Better World Capital Investments PLC exists to improve how capital reaches productive economic activity. We develop and coordinate financial architecture that connects the needs of businesses and projects with appropriate capital, institutions, technology and strategic partners.</p>',
    '<p>Our purpose is to improve how capital reaches productive activity. We start with what a business or project needs, then design financial architecture that matches it with capital, institutions, technology and partners. The aim is productive growth, resilient businesses and long-term impact.</p>'],
  ['\n              <p>Our objective is to support productive growth, stronger and more resilient businesses, and measurable long-term economic impact by designing financial structures around the underlying economic need rather than starting with a predetermined financial product.</p>\n            </div>',
    '\n            </div>\n            <span class="pu-lbl">What “Better World” means</span>\n            <div class="pu-body">\n              <p>“Better World” names a view about where impact belongs. Impact is often assessed after capital has already been allocated. Our approach considers it earlier: when capital is structured, owned and deployed.</p>\n            </div>'],
  ['<h2 class="h1">BWCI’s role</h2>', '<h2 class="h1">Our role, in brief</h2>'],
  ['<p class="lead">Better World Capital Investments PLC is the holding company and financial architecture layer of the Better World ecosystem.</p>',
    '<p class="lead">BWCI is the financial architecture layer of the Better World ecosystem: it designs financial structures, connects participants, coordinates their roles and develops the ecosystem. Any financial activity is delivered by the relevant operating or regulated entity.</p>'],
  ['<li><span><b>develop, own and support</b> financial platforms and investment vehicles within the Better World ecosystem where appropriate;</span></li>', '<li><span><b>develop and support</b> platforms and investment vehicles where appropriate;</span></li>'],
  ['<p>BWCI architects, connects, coordinates and develops the financial ecosystem; the appropriate operating or regulated entity delivers the relevant financial activity.</p>', '<p>BWCI architects, connects, coordinates and develops. The operating or regulated entity delivers the relevant financial activity.</p>'],
  ['\n            <a class="link" href="Our%20Role.dc.html" style="justify-self:start; margin-top:4px">Read about our role <span class="ar" aria-hidden="true">→</span></a>', ''],
  ['<h2 class="h1">[Principles heading]</h2>\n        </div>', '<h2 class="h1">Our Principles</h2>\n          <p class="lead">Six principles describe how we work and what we expect to be held to.</p>\n        </div>'],
  ['<h2 class="h1">[How we work]</h2>', '<h2 class="h1">From need to reinvestment</h2>'],
  ['<p class="lead">[One sentence introducing the Financial Engine]</p>', '<p class="lead">Our purpose is put into practice through the Financial Engine, BWCI’s method for responding to an economic need.</p>'],
  ['<h2 class="h1">[Leadership &amp; governance]</h2>', '<h2 class="h1">Leadership &amp; governance</h2>'],
  ['[Next-step heading]', 'Start a Conversation'],
  ['[One line inviting the visitor to start a conversation]', 'Whether you represent a business, a project, a capital provider or an institution, a conversation is the first step.'],
  ['Explore our platforms <span', 'Explore Platforms &amp; Institutions <span'],
  // the principles' descriptions (static markup in the source; its PR list in the script is not rendered)
  ['<p>We begin with the economic requirement, not with a predetermined financial product.</p>', '<p>We start with the economic requirement of a business or project, not with a predetermined financial product. The structure is then designed around that need.</p>'],
  ['<p>Businesses, institutions and partners can participate in the ecosystem without necessarily giving up their independence or becoming part of a single corporate structure.</p>', '<p>Businesses, institutions and partners can take part in the Better World ecosystem without giving up their independence. Our Role explains how they connect and what the principle does not cover.</p>'],
  ['<p>We distinguish clearly between what exists today, what is being developed and what is proposed, and we support claims with evidence wherever possible.</p>', '<p>We distinguish clearly between what is operating today, what is in development and what is proposed. Each claim we make about BWCI and the Better World ecosystem should be supported by evidence.</p>'],
  ['<p>Impact should not be treated only as an assessment after capital is deployed. It should influence how capital is structured, allocated and managed from the outset.</p>', '<p>Impact should shape how capital is allocated and managed from the start. It belongs in the design of a structure, not only in a review afterwards.</p>'],
  ['<p>Ownership, responsibility, regulatory boundaries and decision-making should be transparent and appropriately governed.</p>', '<p>Ownership, responsibility, regulatory boundaries and decision-making should be transparent and well governed. Each participant’s role, and who answers for it, should be clear.</p>'],
  ['<p>We focus on building durable institutions, productive businesses and resilient financial structures rather than pursuing short-term transactions in isolation.</p>', '<p>We aim to build durable institutions and resilient structures, rather than isolated short-term deals. Each step should be planned and delivered with that long-term purpose in view.</p>'],
];
// this page's card names and roles (the shared people data elsewhere is unchanged)
const PEOPLE = [
  ["P('alexander-alegria-saif', 'Alex Alegria-Seif', 'AS', [{ title: 'Chairman', entity: 'Better World Capital Investments PLC' }]", "P('alexander-alegria-saif', 'Alexander Alegria-Seif', 'AS', [{ title: 'Chairman', entity: null }]"],
  ["P('farhad-reyazat', 'Dr Farhad Reyazat', 'FR', [{ title: 'Founder & Chief Executive Officer', entity: 'Better World Capital Investments PLC' }]", "P('farhad-reyazat', 'Dr Farhad Reyazat', 'FR', [{ title: 'Founder & Chief Executive Officer', entity: null }]"],
  ["[{ title: 'Director', entity: null }, { title: 'Head of Compliance', entity: null }]", "[{ title: 'Director', entity: null }]"],
  ["P('richard-werner', 'Professor Richard A. Werner', 'RW', [{ title: null, entity: null }]", "P('richard-werner', 'Professor Richard A. Werner', 'RW', [{ title: 'Strategic Banking Advisor', entity: null }]"],
];

const read = (f) => fs.readFileSync(path.join(DESIGN, f), 'utf8').replace(/\r\n?/g, '\n');
module.exports = {
  MERGED_NAME,
  // MERGED_PROPS="founderQuote=false,nextRow=false" rewrites those prop defaults (compare with preview/plain-props.html)
  page: () => (process.env.MERGED_PROPS || '').split(',').filter(Boolean).reduce((src, kv) => {
    const [k, v] = kv.split('=');
    return apply(src, [['&quot;' + k + '&quot;:{&quot;editor&quot;:&quot;boolean&quot;,&quot;default&quot;:true', '&quot;' + k + '&quot;:{&quot;editor&quot;:&quot;boolean&quot;,&quot;default&quot;:' + v]], 'prop ' + k);
  }, apply(read('Who We Are.dc.html'), PAGE, 'Who We Are.dc.html')),
  people: () => apply(read('bwci-people.js'), PEOPLE, 'bwci-people.js'),
};
if (require.main === module) {
  module.exports.page(); module.exports.people();
  console.log('merged source OK:', PAGE.length + ' page and ' + PEOPLE.length + ' people substitutions');
}
