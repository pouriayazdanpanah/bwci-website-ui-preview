// Dev-only: builds the shared site chrome for the GoHighLevel page ports. It covers the header, the
// breadcrumb and the footer, the shared system CSS (bwci-system.css), and the scroll motion
// (bwci-motion.js), all scoped to one page prefix.
//   const chrome = require('../../../shared/site-chrome/site-chrome')({ prefix: 'plt', current: 'platforms', ... });
// Nothing here runs in GoHighLevel. A page's _build/build.js inlines the output into its pasteable blocks.
//
// The design export stays the source of truth. These are read from design/ at build time:
//   SiteHeader.dc.html  → header CSS, plus the NAV and UTIL data of its text/x-dc component
//   SiteFooter.dc.html  → footer CSS and the link columns of its markup
//   Breadcrumb.dc.html  → TRAILS, plus its inline styles (kept inline, as in the source)
//   bwci-system.css     → parts A, A2, B and D; with content:true also C and E (the .bw content pages)
//   GovNav.dc.html      → the governance section bar (govnav option), with its own runtime part
//   PersonCard.dc.html + bwci-people.js + image-slot.js → person cards (people option), with their own runtime part
// Every design href must map to a config link key (HREF_KEYS below). An unknown href fails the build,
// so a new design destination cannot slip through without a config key.
'use strict';
const fs = require('fs');
const path = require('path');

const DESIGN = path.resolve(__dirname, '../../../design');
const RUNTIME = path.join(__dirname, 'site-chrome.runtime.js');
const GOVNAV_RUNTIME = path.join(__dirname, 'site-chrome.govnav.js');
const PEOPLE_RUNTIME = path.join(__dirname, 'site-chrome.people.js');
const LOGO = path.join(__dirname, 'assets', 'bwci-logo.png');

// design href → config link key
const HREF_KEYS = {
  'Main.dc.html': 'home',
  'Who%20We%20Are.dc.html': 'whoWeAre',
  'Who%20We%20Are.dc.html#purpose': 'whoPurpose',
  'Who%20We%20Are.dc.html#role': 'whoRole',
  'Who%20We%20Are.dc.html#principles': 'whoPrinciples',
  'Who%20We%20Are.dc.html#story': 'whoStory',
  'Governance%20Leadership.dc.html': 'leadership',
  'Governance%20Board.dc.html': 'governanceBoard',
  'Governance.dc.html#framework': 'governanceFramework',
  'FinancialEngine.dc.html': 'financialEngine',
  'Main.dc.html#impact': 'impact',
  'Main.dc.html#today': 'today',
  'Ecosystem.dc.html': 'ecosystem',
  'Platforms.dc.html': 'platforms',
  'SMEs%20Projects.dc.html': 'smes',
  'Investors%20Partners.dc.html': 'investors',
  'Private%20Investors.dc.html': 'privateInvestors',
  'Governance.dc.html': 'governance',
  'Corporate%20IR.dc.html': 'corporateIR',
  'Contact.dc.html': 'contact',
  'Verify%20a%20Communication.dc.html': 'verify',
  'Legal.dc.html#privacy': 'legalPrivacy',
  'Legal.dc.html#terms': 'legalTerms',
  'Legal.dc.html#cookies': 'legalCookies',
  'Legal.dc.html#disclosures': 'legalDisclosures',
  'Legal.dc.html#accessibility': 'legalAccessibility',
  'Legal.dc.html#sitemap': 'legalSitemap',
};
// Default routes. Pages that already have a GHL port point at their live path. "#" marks a destination
// that is designed (or only linked) but has no GHL page yet; the page READMEs list these as unresolved.
// impact/today are sections of the updated Main port (ids bwci-impact / bwci-today).
const LINK_DEFAULTS = {
  home: '/', financialEngine: '/financial-engine', ecosystem: '/ecosystem', platforms: '/platforms',
  smes: '/smes-projects', investors: '/investors-partners', impact: '/#bwci-impact', today: '/#bwci-today',
  whoWeAre: '#', whoPurpose: '#', whoRole: '#', whoPrinciples: '#', whoStory: '#', leadership: '#',
  privateInvestors: '#', governance: '#', corporateIR: '#', contact: '#', verify: '#',
  governanceBoard: '#', governanceFramework: '#',
  legalPrivacy: '#', legalTerms: '#', legalCookies: '#', legalDisclosures: '#', legalAccessibility: '#', legalSitemap: '#',
};

// Git for Windows may check design files out with CRLF; parser markers use canonical LF.
const read = (f) => fs.readFileSync(path.join(DESIGN, f), 'utf8').replace(/\r\n?/g, '\n');
const between = (s, a, b) => { const i = s.indexOf(a); const j = s.indexOf(b, i + a.length); if (i < 0 || j < 0) throw new Error('Marker not found: ' + a); return s.slice(i + a.length, j); };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function keyOf(href) { if (!(href in HREF_KEYS)) throw new Error('Design href without a config link key: ' + href); return HREF_KEYS[href]; }
// evaluates `const NAME = ...;` declarations taken from a component's text/x-dc script
function constants(script, names) {
  const decl = names.map((n) => { const m = new RegExp('const ' + n + ' = [\\[{]\\n[\\s\\S]*?\\n[\\]}];\\n|const ' + n + ' = [^\\n]*;\\n').exec(script); if (!m) throw new Error('const ' + n + ' not found'); return m[0]; });
  // eslint-disable-next-line no-new-func
  return new Function(decl.join('') + 'return {' + names.join(',') + '};')();
}

/* ---------------- CSS helpers ---------------- */
// rename class tokens in selectors (only selectors carry ".name" with a leading letter)
function renameClasses(css, fn) { return css.replace(/\.(-?[_a-zA-Z][\w-]*)/g, (m, n) => '.' + fn(n)); }
// split at top-level commas (not inside parentheses)
function splitTop(sel) {
  const out = []; let depth = 0, start = 0;
  for (let i = 0; i < sel.length; i++) {
    const c = sel[i];
    if (c === '(') depth++; else if (c === ')') depth--;
    else if (c === ',' && depth === 0) { out.push(sel.slice(start, i)); start = i + 1; }
  }
  out.push(sel.slice(start));
  return out.map((x) => x.trim()).filter(Boolean);
}
// expand :is(a,b) into separate selectors, so the page build can prune the alternatives a page never renders
function expandIs(css) {
  return css.replace(/(\s*)([^{}\s][^{}]*)\{/g, (all, ws, prelude) => {
    if (!prelude.includes(':is(') || prelude.trim().startsWith('@')) return all;
    let list = splitTop(prelude);
    for (let guard = 0; list.some((x) => x.includes(':is(')) && guard < 10; guard++) {
      list = list.flatMap((x) => {
        const m = /:is\(([^()]*)\)/.exec(x);
        if (!m) return [x];
        return splitTop(m[1]).map((alt) => x.slice(0, m.index) + alt + x.slice(m.index + m[0].length));
      });
    }
    return ws + list.join(', ') + '{';
  });
}
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

/* ---------------- people (design/bwci-people.js, the single source for Board, Leadership and profiles) ---------------- */
function loadPeople() {
  const win = { dispatchEvent() {} };
  // eslint-disable-next-line no-new-func
  new Function('window', 'Event', read('bwci-people.js'))(win, function Event() {});
  if (!win.BWCI_PEOPLE || !win.BWCI_PEOPLE.all) throw new Error('bwci-people.js changed; review site-chrome.js');
  return win.BWCI_PEOPLE;
}
const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
// config link key of a person's profile page, e.g. profileFarhadReyazat
const profileKey = (slug) => camel('profile-' + slug);

module.exports = function siteChrome(opts) {
  const P = opts.prefix;                 // e.g. 'plt'
  const current = opts.current;          // SiteHeader `current` prop, e.g. 'platforms'
  const crumb = opts.breadcrumb || null; // Breadcrumb `current` prop, or null when the page has none
  const rename = opts.rename || ((n) => n); // page class vocabulary for bwci-system.css (e.g. container → plt-container)
  const withSystem = opts.system !== false;  // false for a page that does not load bwci-system.css / bwci-motion.js (Main)
  const withContent = !!opts.content;      // true for a .bw content page: adds bwci-system.css parts C and E
  const govCur = opts.govnav || null;       // GovNav current prop ('hub', 'board', 'leadership'), or null when the page has none
  const withPeople = !!opts.people;         // true for a page with PersonCard components (Board, Leadership)
  const defaults = Object.assign({}, LINK_DEFAULTS, opts.links || {}); // per-page default routes (e.g. Main's in-page #bwci-impact)
  const L = (k) => 'data-' + P + '-link="' + k + '"';
  const I = (t) => '<span class="' + P + '-i">' + esc(t) + '</span>'; // {{value}} → span.sc-interp in the source runtime

  /* ---------------- header ---------------- */
  const hdrSrc = read('SiteHeader.dc.html');
  const hdrScript = between(hdrSrc, 'data-dc-script', '</script>');
  const { NAV, UTIL } = constants(hdrScript, ['NAV', 'UTIL']);
  const cur = (c) => (c === current ? ' aria-current="page"' : '');
  const SVG_DOWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>';
  const SVG_ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="13 6 19 12 13 18"></polyline></svg>';
  const SVG_PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><line class="' + P + '-hdr__v" x1="12" y1="5" x2="12" y2="19"></line></svg>';
  const SVG_BURGER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><line x1="4" y1="7" x2="20" y2="7"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="17" x2="20" y2="17"></line></svg>';
  const SVG_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18"></line><line x1="18" y1="6" x2="6" y2="18"></line></svg>';
  const LOGO_IMG = '<img data-' + P + '-asset="logoImage" alt="Better World Capital Investments PLC — home" width="640" height="153">';
  const H = P + '-hdr';
  const has = (g) => !!g.items && g.items.some((it) => it.c === current);
  const groupsNav = NAV.map((g) => {
    if (!g.items) return '          <li class="' + H + '__dd"><a class="' + H + '__link" href="' + esc(g.href) + '" ' + L(keyOf(g.href)) + cur(g.k) + '>' + I(g.label) + '</a></li>';
    return [
      '          <li class="' + H + '__dd" data-' + P + '-dd="' + g.k + '">',
      '            <button class="' + H + '__link ' + H + '__trigger" type="button" aria-expanded="false" aria-controls="' + H + '-p-' + g.k + '"' + (has(g) ? ' aria-current="page"' : '') + ' data-' + P + '-dd-btn>' + I(g.label) + SVG_DOWN + '</button>',
      '            <ul class="' + H + '__panel" id="' + H + '-p-' + g.k + '" data-' + P + '-dd-panel hidden>',
      g.items.map((it) => '              <li><a class="' + H + '__item" href="' + esc(it.href) + '" ' + L(keyOf(it.href)) + cur(it.c) + '><span><span class="' + H + '__item-t">' + I(it.t) + '</span><span class="' + H + '__item-d">' + I(it.d) + '</span></span>' + SVG_ARROW + '</a></li>').join('\n'),
      '            </ul>',
      '          </li>',
    ].join('\n');
  }).join('\n');
  const groupsDrawer = NAV.map((g) => {
    if (!g.items) return '          <li><a class="' + H + '__drow" href="' + esc(g.href) + '" ' + L(keyOf(g.href)) + cur(g.k) + ' data-' + P + '-menu-close>' + I(g.label) + SVG_ARROW + '</a></li>';
    const open = has(g); // source: an accordion starts open when it holds the current page
    return [
      '          <li>',
      '            <button class="' + H + '__drow" type="button" aria-expanded="' + open + '" aria-controls="' + H + '-a-' + g.k + '" data-' + P + '-acc="' + g.k + '">' + I(g.label) + SVG_PLUS + '</button>',
      '            <ul class="' + H + '__sub" id="' + H + '-a-' + g.k + '" data-' + P + '-acc-panel="' + g.k + '"' + (open ? '' : ' hidden') + '>',
      g.items.map((it) => '              <li><a href="' + esc(it.href) + '" ' + L(keyOf(it.href)) + cur(it.c) + ' data-' + P + '-menu-close><span class="' + H + '__sub-t">' + I(it.t) + '</span><span class="' + H + '__sub-d">' + I(it.d) + '</span></a></li>').join('\n'),
      '            </ul>',
      '          </li>',
    ].join('\n');
  }).join('\n');
  const utilLinks = (extra) => UTIL.map((u) => '<li><a href="' + esc(u.href) + '" ' + L(keyOf(u.href)) + cur(u.c) + extra + '>' + I(u.t) + '</a></li>');
  const ctaHref = 'Contact.dc.html';
  const header = [
    '<div class="' + H + '-host" data-' + P + '-hdr-host>',
    '<header class="' + H + '" data-' + P + '-hdr>',
    '  <div class="' + H + '__util" data-' + P + '-hdr-util>',
    '    <div class="' + H + '__in">',
    '      <nav aria-label="Corporate">',
    '        <ul>',
    utilLinks('').map((s) => '          ' + s).join('\n'),
    '        </ul>',
    '      </nav>',
    '    </div>',
    '  </div>',
    '  <div class="' + H + '__bar">',
    '    <div class="' + H + '__in">',
    '      <a class="' + H + '__logo" href="Main.dc.html" ' + L('home') + '>' + LOGO_IMG + '</a>',
    '      <nav class="' + H + '__nav" aria-label="Primary">',
    '        <ul class="' + H + '__list">',
    groupsNav,
    '        </ul>',
    '      </nav>',
    '      <a class="' + H + '__cta" href="' + ctaHref + '" ' + L(keyOf(ctaHref)) + cur('contact') + '>Start a Conversation</a>',
    '      <button class="' + H + '__burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="' + H + '-drawer" data-' + P + '-menu-open>' + SVG_BURGER + '</button>',
    '    </div>',
    '  </div>',
    '  <div class="' + H + '__scrim" aria-hidden="true" data-' + P + '-menu-close data-' + P + '-menu-part hidden></div>',
    '  <div class="' + H + '__drawer" id="' + H + '-drawer" role="dialog" aria-modal="true" aria-label="Site menu" data-' + P + '-drawer data-' + P + '-menu-part hidden>',
    '    <div class="' + H + '__dhead">',
    '      <a class="' + H + '__logo" href="Main.dc.html" ' + L('home') + ' data-' + P + '-menu-close>' + LOGO_IMG + '</a>',
    '      <button class="' + H + '__x" type="button" aria-label="Close menu" data-' + P + '-menu-close data-' + P + '-menu-x>' + SVG_X + '</button>',
    '    </div>',
    '    <nav class="' + H + '__dbody" aria-label="Primary">',
    '      <ul class="' + H + '__dlist">',
    groupsDrawer,
    '      </ul>',
    '      <ul class="' + H + '__dutil" aria-label="Corporate">',
    utilLinks(' data-' + P + '-menu-close').map((s) => '        ' + s).join('\n'),
    '      </ul>',
    '    </nav>',
    '    <div class="' + H + '__dfoot"><a class="' + H + '__cta" href="' + ctaHref + '" ' + L(keyOf(ctaHref)) + cur('contact') + ' data-' + P + '-menu-close>Start a Conversation</a></div>',
    '  </div>',
    '</header>',
    '</div>',
  ].join('\n');
  // the source header markup must still be the one this generator reproduces
  ['class="hdr__util"', 'class="hdr__logo" href="Main.dc.html"', 'class="hdr__cta" href="Contact.dc.html"', 'class="hdr__dutil"', 'class="hdr__dfoot"', 'onMouseEnter="{{ g.enter }}"', 'onKeyDown="{{ drawerKey }}"']
    .forEach((s) => { if (!hdrSrc.includes(s)) throw new Error('SiteHeader.dc.html changed; review the generator: ' + s); });

  /* ---------------- breadcrumb (inline styles kept, as in the source) ---------------- */
  let breadcrumb = '';
  if (crumb) {
    const bcSrc = read('Breadcrumb.dc.html');
    const bcScript = between(bcSrc, 'data-dc-script', '</script>');
    const C = constants(bcScript, ['HOME', 'HIW', 'INV', 'GOV', 'TRAILS']);
    const t = crumb === 'gov-profile' && opts.profile
      ? [C.HOME, C.GOV, opts.profile.via === 'board'
        ? ['Board of Directors', 'Governance%20Board.dc.html']
        : ['Leadership', 'Governance%20Leadership.dc.html'], [opts.profile.name || '']]
      : C.TRAILS[crumb];
    if (!t) throw new Error('No breadcrumb trail for ' + crumb);
    const style = (re) => { const m = re.exec(bcSrc); if (!m) throw new Error('Breadcrumb style not found: ' + re); return m[1]; };
    const sNav = style(/<nav aria-label="Breadcrumb" style="([^"]*)"/);
    const sOl = style(/<ol style="([^"]*)"/);
    const sLi = style(/<li style="([^"]*)"/);
    const sA = style(/<a href="\{\{ c\.href \}\}" style="([^"]*)"/);
    const sTx = style(/<span style="([^"]*)">\{\{ c\.t \}\}<\/span>/);
    const sCur = style(/<span aria-current="page" style="([^"]*)"/);
    const svg = /(<svg width="12"[\s\S]*?<\/svg>)/.exec(bcSrc)[1];
    const items = t.map(([label, href], i) => {
      const last = i === t.length - 1;
      let inner;
      if (last) inner = '<span aria-current="page" style="' + esc(sCur) + '">' + I(label) + '</span>';
      else if (href) inner = '<a class="' + P + '-bc__a" href="' + esc(href) + '" ' + L(keyOf(href)) + ' style="' + esc(sA) + '">' + I(label) + '</a>';
      else inner = '<span style="' + esc(sTx) + '">' + I(label) + '</span>';
      return '      <li style="' + esc(sLi) + '">' + inner + (last ? '' : svg) + '</li>';
    });
    breadcrumb = [
      '<div class="' + P + '-bc-host">',
      '  <nav aria-label="Breadcrumb" style="' + esc(sNav) + '">',
      '    <ol style="' + esc(sOl) + '">',
      items.join('\n'),
      '    </ol>',
      '  </nav>',
      '</div>',
    ].join('\n');
    // style-hover / style-focus of the source link (the runtime emits them as !important :hover / :focus rules)
    if (!/style-hover="color:#FFFFFF;"/.test(bcSrc) || !/style-focus="outline:2px solid #E8C46B; outline-offset:3px;"/.test(bcSrc)) throw new Error('Breadcrumb hover/focus styles changed; update site-chrome.js');
  }

  /* ---------------- governance section bar (GovNav; inline styles kept, as in the source) ---------------- */
  let govnav = '';
  if (govCur) {
    const gnSrc = read('GovNav.dc.html');
    const { SECTIONS } = constants(between(gnSrc, 'data-dc-script', '</script>'), ['SECTIONS']);
    const style = (re) => { const m = re.exec(gnSrc); if (!m) throw new Error('GovNav style not found: ' + re); return m[1]; };
    const sNav = style(/<nav aria-label="Governance sections" style="([^"]*)"/);
    const sIn = style(/<nav [^>]*>\s*<div style="([^"]*)"/);
    const sUl = style(/<ul style="([^"]*)"/);
    const sLi = style(/<li style="([^"]*)"/);
    const sOn = style(/aria-current="page" style="([^"]*)"/);
    const sOff = style(/<sc-if value="\{\{ it\.off \}\}"[^>]*><a href="\{\{ it\.href \}\}" style="([^"]*)"/);
    const sLabel = style(/<label style="([^"]*)"/);
    const sLabelT = style(/<label [^>]*>\s*<span style="([^"]*)">Section<\/span>/);
    const sWrap = style(/Section<\/span>\s*<span style="([^"]*)"/);
    const sSel = style(/<select [^>]*style="([^"]*)"/);
    const svg = /(<svg width="14"[\s\S]*?<\/svg>)/.exec(gnSrc)[1];
    // the source emits style-hover / style-focus as !important :hover / :focus rules (see css())
    if (!/style-hover="color:#123039; border-bottom-color:#D5E0DC;"/.test(gnSrc) || (gnSrc.match(/style-focus="outline:2px solid #12836B; outline-offset:-2px;"/g) || []).length !== 2) throw new Error('GovNav hover/focus styles changed; update site-chrome.js');
    if (!/window\.matchMedia\('\(max-width:767px\)'\)/.test(gnSrc)) throw new Error('GovNav breakpoint changed; update site-chrome.govnav.js');
    // on the hub the framework link stays on the page; elsewhere it is a configured route
    const target = (href) => (govCur === 'hub' && href === 'Governance.dc.html#framework' ? { href: '#' + P + '-framework', attr: '' } : { href: defaults[keyOf(href)], attr: ' ' + L(keyOf(href)) });
    const items = SECTIONS.map((sct) => {
      const on = sct.k === govCur, tg = target(sct.href);
      return '          <li style="' + esc(sLi) + '"><a class="' + P + '-gn__a' + (on ? '' : ' ' + P + '-gn__a--off') + '" href="' + esc(tg.href) + '"' + tg.attr +
        (on ? ' aria-current="page" style="' + esc(sOn) + '"' : ' style="' + esc(sOff) + '"') + '>' + I(sct.t) + '</a></li>';
    });
    const opts = (govCur === 'hub' ? [{ t: 'Governance overview', href: 'Governance.dc.html' }] : []).concat(SECTIONS);
    const curS = SECTIONS.find((sct) => sct.k === govCur);
    const curHref = curS ? curS.href : 'Governance.dc.html';
    const options = opts.map((o) => { const tg = target(o.href); return '              <option value="' + esc(tg.href) + '"' + tg.attr + (o.href === curHref ? ' selected' : '') + '>' + esc(o.t) + '</option>'; });
    govnav = [
      '<div class="' + P + '-gn-host" data-' + P + '-govnav>',
      '  <nav aria-label="Governance sections" style="' + esc(sNav) + '">',
      '    <div style="' + esc(sIn) + '">',
      '      <ul style="' + esc(sUl) + '" data-' + P + '-gn-wide>',
      items.join('\n'),
      '      </ul>',
      '      <label style="' + esc(sLabel) + '" data-' + P + '-gn-narrow hidden>',
      '        <span style="' + esc(sLabelT) + '">Section</span>',
      '        <span style="' + esc(sWrap) + '">',
      '          <select style="' + esc(sSel) + '" data-' + P + '-gn-select>',
      options.join('\n'),
      '          </select>',
      '          ' + svg,
      '        </span>',
      '      </label>',
      '    </div>',
      '  </nav>',
      '</div>',
    ].join('\n');
  }

  /* ---------------- person cards (PersonCard; data from bwci-people.js, portrait in an image-slot) ---------------- */
  const D = withPeople ? loadPeople() : null;
  let personCard = null;
  if (withPeople) {
    const pcSrc = read('PersonCard.dc.html');
    // the template this mirrors; fail loudly if the component changes
    ['<div class="gv-card-img">', '<image-slot id="{{ slotId }}" shape="rect" src="{{ photo }}" placeholder="{{ initials }}"></image-slot>',
      '<div class="gv-card-ov" aria-hidden="true"><span>View profile <span>→</span></span></div>', '<div class="gv-card-t">', '<b>{{ name }}</b>',
      '<div class="gv-role"><span>{{ r.title }}</span><span>{{ r.entity }}</span></div>', "cls: 'gv-card' + (sm ? ' gv-card--sm' : '')",
      ".filter(r => r.title || r.entity)", "aria: p.name + ', view profile'"]
      .forEach((t) => { if (!pcSrc.includes(t)) throw new Error('PersonCard.dc.html changed; review site-chrome.js: ' + t); });
    // markup of one card, as the source renders it (each {{value}} in span.sc-interp → .<prefix>-i, empty values included)
    personCard = (slug, from, size) => {
      const p = D.get(slug);
      if (!p) throw new Error('Unknown person: ' + slug);
      if (encodeURI(p.file) !== D.href(p, '')) throw new Error('bwci-people.js href rule changed; review site-chrome.js');
      const roles = p.roles.map((r) => ({ title: r.title || '', entity: r.entity || '' })).filter((r) => r.title || r.entity);
      return [
        '<a href="#" aria-label="' + esc(p.name + ', view profile') + '" class="gv-card' + (size === 'sm' ? ' gv-card--sm' : '') + '" ' + L(profileKey(slug)) + (from ? ' data-' + P + '-from="' + esc(from) + '"' : '') + '>',
        '  <div class="gv-card-img">',
        '    <div class="' + P + '-slot" data-' + P + '-slot="person-' + esc(slug) + '"><div class="' + P + '-slot__frame"><img data-' + P + '-person="' + esc(slug) + '" alt="" draggable="false"></div></div>',
        '    <div class="gv-card-ov" aria-hidden="true"><span>View profile <span>→</span></span></div>',
        '  </div>',
        '  <div class="gv-card-t">',
        '    <b>' + I(p.name) + '</b>',
      ].concat(roles.map((r) => '    <div class="gv-role"><span>' + I(r.title) + '</span><span>' + I(r.entity) + '</span></div>'), [
        '  </div>',
        '</a>',
      ]).join('\n');
    };
  }

  /* ---------------- footer ---------------- */
  const ftSrc = read('SiteFooter.dc.html');
  const F = P + '-sft';
  const navs = [...ftSrc.matchAll(/<nav aria-label="([^"]+)"><h2>([^<]+)<\/h2><ul>([\s\S]*?)<\/ul><\/nav>/g)];
  if (navs.length !== 4) throw new Error('SiteFooter.dc.html: expected 4 link columns, found ' + navs.length);
  const linkItems = (ul, ind) => [...ul.matchAll(/<li><a href="([^"]+)">([^<]+)<\/a><\/li>/g)].map((m) => ind + '<li><a href="' + m[1] + '" ' + L(keyOf(m[1])) + '>' + m[2] + '</a></li>').join('\n');
  const legalUl = /<nav aria-label="Legal"><ul>([\s\S]*?)<\/ul><\/nav>/.exec(ftSrc);
  const tagline = /<div class="sft__brand">[\s\S]*?<p>([^<]+)<\/p>/.exec(ftSrc)[1];
  const logoStyle = /<div class="sft__brand">\s*<a href="Main.dc.html" style="([^"]*)"/.exec(ftSrc)[1];
  const ftScript = between(ftSrc, 'data-dc-script', '</script>');
  if (!/parts = \['Better World Capital Investments PLC'\]/.test(ftScript)) throw new Error('SiteFooter legal line changed; update site-chrome.js');
  const footer = [
    '<div class="' + F + '-host" data-' + P + '-footer>',
    '<footer class="' + F + '">',
    '  <div class="' + F + '__in">',
    '    <div class="' + F + '__grid">',
    '      <div class="' + F + '__brand">',
    '        <a href="Main.dc.html" ' + L('home') + ' style="' + logoStyle + '">' + LOGO_IMG + '</a>',
    '        <p>' + tagline + '</p>',
    '      </div>',
    navs.map((m) => '      <nav aria-label="' + m[1] + '"><h2>' + m[2] + '</h2><ul>\n' + linkItems(m[3], '        ') + '\n      </ul></nav>').join('\n'),
    '    </div>',
    '    <div class="' + F + '__legal" data-' + P + '-legal>',
    '      <div class="' + F + '__bar">',
    '        <span>' + '<span class="' + P + '-i" data-' + P + '-legal-line>Better World Capital Investments PLC</span>' + '</span>',
    '        <nav aria-label="Legal"><ul>',
    linkItems(legalUl[1], '          '),
    '        </ul></nav>',
    '      </div>',
    '    </div>',
    '  </div>',
    '</footer>',
    '</div>',
  ].join('\n');

  /* ---------------- CSS (unscoped; the page build scopes and prunes it) ---------------- */
  function css() {
    const sys = read('bwci-system.css');
    let partsABD = sys.slice(0, sys.indexOf('/* C — content-page components'));
    if (!partsABD.includes('/* D — motion')) throw new Error('bwci-system.css layout changed; review site-chrome.js');
    partsABD = stripComments(partsABD).replace(/:root\{/g, ':scope{')
      .replace(/\.bw-motion \[data-bw-rv/g, ':scope.__motion__ [data-bw-rv');
    partsABD = expandIs(renameClasses(partsABD, (n) => (n === '__motion__' ? P + '-motion' : rename(n))))
      .replace(/\bbw(HeroIn|MediaIn)\b/g, P + '-bw$1');
    // parts C and E: .bw is the page wrapper, i.e. the widget root (class <prefix>-bw), so every selector keeps
    // the source's class count and gains the root id, which keeps the source's specificity order
    // the image-slot custom element becomes a plain .<prefix>-slot block (same geometry, see site-chrome.people.js)
    let partsCE = stripComments(sys.slice(sys.indexOf('/* C — content-page components'))).replace(/\.bw(?![\w-])/g, ':scope.__bw__')
      .replace(/(^|[\s,>+~(])image-slot(?![\w-])/gm, '$1.__slot__');
    partsCE = expandIs(renameClasses(partsCE, (n) => (n === '__bw__' ? P + '-bw' : n === '__slot__' ? P + '-slot' : rename(n)))).replace(/\bbw(HeroIn|MediaIn)\b/g, P + '-bw$1');
    const comp = (src) => stripComments(between(src, '<style>', '</style>')).replace(/html\{[^}]*\}\s*/g, '');
    const hdrCss = renameClasses(comp(hdrSrc), (n) => n.replace(/^hdr(?![a-zA-Z0-9])/, H)).replace(/\bhdr(In|Fade|Slide)\b/g, P + '-hdr$1');
    const ftCss = renameClasses(comp(ftSrc), (n) => n.replace(/^sft(?![a-zA-Z0-9])/, F));
    return [
      '/* ==========================================================================',
      '   SHARED SITE CHROME — generated by ghl/shared/site-chrome/site-chrome.js (do not edit here)',
      '   Cascade order of the source page: page <style> → bwci-system.css → Breadcrumb hover/focus →',
      '   SiteHeader → SiteFooter.',
      '   ========================================================================== */',
    ].concat(withSystem ? [
      '/* bwci-system.css — parts A, A2, B, D (class names in this page\'s vocabulary) */',
      partsABD.trim(),
      '',
    ] : []).concat(withSystem && withContent ? [
      '/* bwci-system.css — parts C, E (content pages; .bw = this widget root) */',
      partsCE.trim(),
      '',
    ] : []).concat(withPeople ? [
      '/* image-slot.js — the custom element\'s own (shadow) styles: host, frame and image; part E positions it in the card */',
      '.' + P + '-slot{ display:block; position:relative; font:13px/1.3 system-ui,-apple-system,sans-serif; width:100%; height:100%; aspect-ratio:3/2; }',
      '.' + P + '-slot__frame{ position:absolute; inset:0; overflow:hidden; background:rgba(127,127,127,.08); }',
      '.' + P + '-slot__frame img{ display:block; position:absolute; max-width:none; left:50%; top:50%; width:100%; height:100%; transform:translate(-50%,-50%); -webkit-user-drag:none; user-select:none; touch-action:none; }',
      '',
    ] : []).concat(govCur ? [
      '/* GovNav.dc.html — the dc-import wrapper, and style-hover / style-focus (the inline styles stay on the elements) */',
      '.' + P + '-gn-host{ display:block; position:sticky; top:calc(var(--nav-h, 116px) - var(--util-h, 0px)); z-index:50; }',
      '.' + P + '-gn-host [hidden]{ display:none !important; }',
      '.' + P + '-gn__a--off:hover{ color:#123039 !important; border-bottom-color:#D5E0DC !important; }',
      '.' + P + '-gn__a:focus{ outline:2px solid #12836B !important; outline-offset:-2px !important; }',
      '',
    ] : []).concat([
      '/* Breadcrumb.dc.html — style-hover / style-focus (the inline styles stay on the elements) */',
      '.' + P + '-bc__a:hover{ color:#FFFFFF !important; }',
      '.' + P + '-bc__a:focus{ outline:2px solid #E8C46B !important; outline-offset:3px !important; }',
      '',
      '/* SiteHeader.dc.html — the dc-import wrapper of the page is .' + H + '-host */',
      '.' + H + '-host{ position:sticky; top:calc(var(--util-h, 0px) * -1); z-index:60; display:block; width:100%; }',
      hdrCss.trim(),
      '',
      '/* SiteFooter.dc.html — the dc-import wrapper of the page is .' + F + '-host */',
      '.' + F + '-host{ display:block; width:100%; }',
      ftCss.trim(),
      '',
    ]).join('\n');
  }

  /* ---------------- runtime (inlined into the page script) ---------------- */
  const runtime = (fs.readFileSync(RUNTIME, 'utf8') + (govCur ? '\n' + fs.readFileSync(GOVNAV_RUNTIME, 'utf8') : '') +
    (withPeople ? '\n' + fs.readFileSync(PEOPLE_RUNTIME, 'utf8') : '')).replace(/__P__/g, P).trim();

  const links = {};
  for (const m of (header + breadcrumb + govnav + footer).matchAll(new RegExp('data-' + P + '-link="([^"]+)"', 'g'))) links[m[1]] = defaults[m[1]];
  // the generated markup keeps the design hrefs; the page build swaps them for the config defaults
  const swap = (h) => h.replace(new RegExp('href="([^"]+)" data-' + P + '-link="([^"]+)"', 'g'), (_, href, k) => 'href="' + esc(defaults[k]) + '" data-' + P + '-link="' + k + '"');

  return {
    header: swap(header), breadcrumb: swap(breadcrumb), govnav, footer: swap(footer), css, runtime,
    links,                                  // chrome link keys used by this page, with default routes
    unresolved: Object.keys(links).filter((k) => links[k] === '#'),
    dynamicClasses: [H + '--stuck', P + '-motion', F + '__reg'],
    logoPath: LOGO,
    // person cards: markup function, and per person the profile link key and the portrait file (for the page config)
    personCard,
    people: D ? D.all.map((p) => ({ slug: p.slug, name: p.name, linkKey: profileKey(p.slug), photoPath: p.photo ? path.join(DESIGN, p.photo) : null })) : null,
  };
};
module.exports.HREF_KEYS = HREF_KEYS;
module.exports.LINK_DEFAULTS = LINK_DEFAULTS;

// Development-only data access for the reusable profile generator.
module.exports.loadPeople = loadPeople;
