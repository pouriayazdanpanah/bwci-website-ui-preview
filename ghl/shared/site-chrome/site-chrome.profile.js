// Development-only GovProfile renderer; final blocks contain no reference to this module.
'use strict';
const fs = require('fs');
const path = require('path');
const siteChrome = require('./site-chrome');
const DESIGN = path.resolve(__dirname, '../../../design');
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
module.exports = function profileParts({slug, prefix: P, rename}) {
  const D = siteChrome.loadPeople(), p = D.get(slug);
  if (!p) throw new Error('Unknown profile: ' + slug);
  const source = fs.readFileSync(path.join(DESIGN, 'GovProfile.dc.html'), 'utf8');
  ["this.state.from || (p.board ? 'board' : 'leadership')", "D.board.filter(b => b.slug !== p.slug)",
    "Math.abs(dx) > 6", "['Board of Directors']", "{ k: 'Principal experience'", "{ k: 'Board / committee role'",
    "(p.bio ? [p.bio] : [])"].forEach(s => { if (!source.includes(s)) throw new Error('GovProfile behavior changed: ' + s); });
  const defaultVia = p.board ? 'board' : 'leadership';
  const contexts = {};
  let chrome;
  for (const via of ['board', 'leadership']) {
    const c = siteChrome({prefix: P, current: 'governance', breadcrumb: 'gov-profile', profile: {name: p.name, via},
      govnav: via, content: true, people: true, rename});
    contexts[via] = {breadcrumb: c.breadcrumb, govnav: c.govnav};
    if (via === defaultVia) chrome = c;
  }
  const I = s => '<span class="' + P + '-i">' + esc(s) + '</span>';
  let html = source.slice(source.indexOf('<section'), source.indexOf('</x-dc>')).trim();
  const loops = {
    roles: p.roles.map(r => ({'r.line': [r.title, r.entity].filter(Boolean).join(', ')})).filter(r => r['r.line']),
    labels: (p.board ? ['Board of Directors'] : []).concat(['Leadership']).map(l => ({l})),
    bio: (Array.isArray(p.bio) ? p.bio : p.bio ? [p.bio] : []).map(para => ({para})),
    fields: [
      ['Principal experience', D.tbc(p.experience, 'Principal experience')],
      ['Qualifications', D.tbc(p.qualifications, 'Qualifications')],
      ['Area of responsibility', D.tbc(p.responsibility, 'Area of responsibility')],
      ['Board / committee role', D.tbc(p.committee, 'Board / committee role')],
    ].concat(p.linkedin ? [['LinkedIn', p.linkedin]] : []).map(([k,v]) => ({'f.k': k, 'f.v': v})),
    also: D.board.filter(b => b.slug !== p.slug).map(b => ({'a.slug': b.slug})),
  };
  const found = new Set();
  html = html.replace(/<sc-for list="\{\{ (\w+) \}\}"[^>]*>([\s\S]*?)<\/sc-for>/g, (_, key, body) => {
    if (!Object.hasOwn(loops, key)) throw new Error('Unknown GovProfile loop: ' + key);
    found.add(key);
    return loops[key].map(values => {
      if (key === 'also') return body.replace(/<dc-import name="PersonCard"[^>]*><\/dc-import>/,
        () => '<div class="' + P + '-pc-host" style="display:block; width:100%">' + chrome.personCard(values['a.slug'], 'board', 'sm') + '</div>');
      return body.replace(/\{\{ ([\w.]+) \}\}/g, (token, name) => {
        if (!Object.hasOwn(values, name)) throw new Error('Unknown profile value: ' + name);
        return I(values[name]);
      });
    }).join('');
  });
  if (found.size !== 5) throw new Error('GovProfile loop inventory changed');
  html = html.replace(/<dc-import name="Breadcrumb"[^>]*><\/dc-import>/, () => chrome.breadcrumb)
    .replace(/<dc-import name="GovNav"[^>]*><\/dc-import>/, '<!--profile:govnav-->')
    .replace(/<image-slot [^>]*><\/image-slot>/, () => '<div class="' + P + '-slot" data-' + P + '-slot="person-' + esc(slug) + '" style="position:absolute; inset:0; width:100%; height:100%;"><div class="' + P + '-slot__frame"><img data-' + P + '-person="' + esc(slug) + '" alt="" draggable="false"></div></div>')
    .replace(/\sref="\{\{ alsoRef \}\}"/, '')
    .replace(/\{\{ name \}\}/g, () => I(p.name))
    .replace(/class="([^"]*)"/g, (_, cls) => 'class="' + cls.split(/\s+/).map(rename).join(' ') + '"')
    .replace(/\bid="(top|biography|related)"/g, (_, id) => 'id="' + P + '-' + id + '"')
    .replace(/href="Governance%20Board.dc.html"/g, 'href="#" data-' + P + '-link="governanceBoard"')
    .replace(/href="Governance%20Leadership.dc.html"/g, 'href="#" data-' + P + '-link="leadership"');
  if (/\{\{|<sc-|<dc-import|<image-slot/.test(html)) throw new Error('Unresolved GovProfile markup');
  html = html.replace(/^[ \t]+$/gm, '');
  const sections = html.match(/<section\b[\s\S]*?<\/section>/g);
  if (!sections || sections.length !== 3) throw new Error('GovProfile sections changed');
  const contextJson = JSON.stringify({defaultVia, contexts}).replace(/</g, '\\u003c');
  const runtime = '  var PROFILE_CONTEXT = ' + contextJson + ';\n' +
    fs.readFileSync(path.join(__dirname, 'site-chrome.profile.runtime.js'), 'utf8').replace(/__P__/g, P);
  return {chrome, hero: sections[0], biography: sections[1], related: sections[2], runtime,
    imageSlugs: [slug].concat(D.board.filter(b => b.slug !== slug).map(b => b.slug))};
};
