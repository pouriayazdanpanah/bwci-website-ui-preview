"""Build linked desktop + mobile wireframe prototypes from the rendered .dc.html wireframes."""
import sys, os, re, json, html, shutil
from playwright.sync_api import sync_playwright

S = sys.argv[1]
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(S, 'site', 'wireframes')
shutil.rmtree(OUT, ignore_errors=True)
os.makedirs(OUT + '/desktop'); os.makedirs(OUT + '/mobile'); os.makedirs(OUT + '/assets')

# ---- screens: slug -> (title, sitemap url, source, desktop ids, mobile ids, core widths)
SCREENS = [
    ('home', 'Homepage', '/', 'home', ['1a'], ['1b']),
    ('engine', 'Financial Engine · signature visual', '/how-it-works/financial-engine', 'engine', ['1a', '1b'], ['1d']),
    ('platforms', 'Platforms & Institutions · hub', '/platforms', 'platforms', ['1a'], ['1b']),
    ('platform-trade-finance', 'Platform page · Trade Finance (template)', '/platforms/trade-finance', 'platforms', ['3a'], ['3b']),
    ('platform-community-banking', 'Platform page · Community Banking (Proposed)', '/platforms/community-banking', 'platforms', ['4a'], ['4b']),
    ('platform-asset-management', 'Platform page · Asset Management / PAM', '/platforms/asset-management', 'platforms', ['5a'], ['5b']),
    ('insights', 'Insights · hub', '/insights', 'insights', ['2a'], ['2b']),
    ('insights-research', 'Insights · Research (category)', '/insights/research', 'insights', ['3a'], ['3c']),
    ('insights-announcements', 'Insights · Corporate Announcements', '/insights/announcements', 'insights', ['3b'], ['3d']),
    ('insights-article', 'Insights · article template', '/insights/[category]/[slug]', 'insights', ['4a'], ['4b']),
    ('insights-announcement', 'Insights · announcement template', '/insights/announcements/[slug]', 'insights', ['5a'], ['5b']),
    ('corporate', 'Corporate / IR · hub', '/corporate', 'corp', ['1a'], ['1b']),
    ('corporate-company', 'Corporate / IR · Company information', '/corporate/company-information', 'corp', ['1c'], ['1d']),
    ('corporate-reports', 'Corporate / IR · Reports & documents', '/corporate/reports-documents', 'corp', ['1e'], ['1f']),
    ('corporate-shareholders', 'Corporate / IR · Shareholder information', '/corporate/shareholder-information', 'corp', ['1g'], ['1h']),
    ('corporate-regulatory', 'Corporate / IR · Regulatory information', '/corporate/regulatory-information', 'corp', ['1i'], ['1j']),
    ('corporate-legal', 'Corporate / IR · Legal notices', '/corporate/legal-notices', 'corp', ['1k'], ['1l']),
]
ENGINE_LABELS = {'1a': 'Option A · continuous path, returns underneath', '1b': 'Option B · circular cycle'}

# ---- pages that exist in sitemap v2 but are not wireframed yet
PLACEHOLDERS = {
    'governance': ('Governance', '/governance', 'Wireframe in progress',
        ['Board of Directors · /governance/board-of-directors', 'Leadership · /governance/leadership',
         'Governance Framework & Documents · /governance/framework', 'Individual profile pages · /governance/leadership/[name]'],
        'Structure follows Dr Reyazat’s 10 October note (Board of Directors | Leadership | Framework). Names, titles and board roles to be confirmed before they are shown.'),
    'who-we-are': ('Who We Are', '/who-we-are', 'Not yet wireframed',
        ['Our Purpose', 'Our Role (incl. group structure ⚠)', 'Our Principles', 'Our Story ⚠', 'Link to Governance › Board & Leadership'], ''),
    'how-it-works': ('How It Works', '/how-it-works', 'Not yet wireframed (Financial Engine visual is wireframed)',
        ['Financial Engine → see the Financial Engine screen', 'Our Ecosystem', 'Better World & Impact ⚠', 'The Platform Today'], ''),
    'impact': ('Better World & Impact', '/how-it-works/impact', 'Not yet wireframed',
        ['Purpose and the real-economy outcomes BWCI aims for', 'How impact is measured ⚠ (no figures until evidenced)', 'Link back to the Financial Engine'], ''),
    'platform-today': ('The Platform Today', '/how-it-works/platform-today', 'Not yet wireframed',
        ['What is operating today vs in development vs proposed', 'Evidence only where it can be verified ⚠'], ''),
    'platform-template': ('Platform page', '/platforms/[platform]', 'Uses the platform page template',
        ['Private Capital, Treasury & Liquidity and Financial Technology use the same template as Trade Finance', 'Child pages wait for the management-confirmed group structure ⚠'], ''),
    'smes': ('SMEs & Projects', '/smes-projects', 'Not yet wireframed',
        ['Single page: need → ecosystem → engagement → illustrative example → enquiry'], ''),
    'investors': ('Investors & Partners', '/investors-partners', 'Not yet wireframed',
        ['Capital providers: Family Offices, HNW/UHNW ⚠, Institutional, Impact, DFIs',
         'Financial institutions: Banks & Lenders, PE & Co-investment', 'Partners: Strategic Corporate, Technology & Infrastructure'], ''),
    'start': ('Start a Conversation', '/start-a-conversation', 'Not yet wireframed',
        ['I’m an SME or Project', 'I’m an Investor or Capital Provider', 'I’m a Bank / Financial Institution', 'I’m a Strategic Partner'], ''),
    'contact': ('Contact', '/contact', 'Not yet wireframed', ['Registered office, general enquiries, media'], ''),
    'verify': ('Verify a Communication', '/verify', 'Not yet wireframed',
        ['How to check that an email, call or document really comes from BWCI', 'Official domains and contact routes'], ''),
}

# ---- link rules (tested against trimmed leaf text, first match wins)
RULES = [
    (r'^BWCI$', 'home'),
    (r'^(Home|…) ›', 'home'),
    (r'Reports (&|and) [Dd]ocuments|^All reports', 'corporate-reports'),
    (r'Company information', 'corporate-company'),
    (r'^Shareholder information', 'corporate-shareholders'),
    (r'^Regulatory information', 'corporate-regulatory'),
    (r'^Legal notices', 'corporate-legal'),
    (r'^Corporate( / IR)?( →| ＋)?$|^Corporate & Investor Relations$|Company documents in Corporate', 'corporate'),
    (r'^Announcements( ↗)?$|→ /insights/announcements|^Corporate Announcements$|^CORPORATE ANNOUNCEMENTS$', 'insights-announcements'),
    (r'^(Research|Perspectives)( ▾)?$|^(RESEARCH|PERSPECTIVES)$', 'insights-research'),
    (r'^Read →$', 'insights-article'),
    (r'^View →$', 'insights-announcement'),
    (r'^(All insights|View all insights) →$|^Insights( ▾)?$', 'insights'),
    (r'^Governance( →| ↗)?$|^GOVERNANCE$|governed →|^Meet our leadership|^View profile|^Leadership & Governance$', 'governance'),
    (r'Explore the Financial Engine|Financial Engine responds|How the Financial Engine works|Start with the Financial Engine|^(The )?Financial Engine →$|See how the Engine responds|^Explore the Financial Engine$', 'engine'),
    (r'^See the platform today', 'platform-today'),
    (r'^Explore Better World', 'impact'),
    (r'^View Trade Finance', 'platform-trade-finance'),
    (r'^View Asset Management', 'platform-asset-management'),
    (r'^Community Banking$|^View Community Banking', 'platform-community-banking'),
    (r'^View (Private Capital|Financial Technology|Treasury & Liquidity)', 'platform-template'),
    (r'^See all platforms|^Platforms & Institutions( ▾)?$', 'platforms'),
    (r'^Who [Ww]e [Aa]re( ▾| ＋| →)?$', 'who-we-are'),
    (r'^How It Works( ▾| ＋)?$', 'how-it-works'),
    (r'^SMEs & Projects$|^For SMEs|^Start with your need', 'smes'),
    (r'^Investors & Partners( ▾)?$|^For Investors|^Investors & Capital Providers$|^Why participate|^Partner with us', 'investors'),
    (r'^Start a Conversation$|^Work with us', 'start'),
    (r'^Contact$|^Contact \+ documents$', 'contact'),
    (r'Verify a Communication', 'verify'),
    (r'^(\[ ☰ \]|≡|☰)$', '#menu'),
]

NAV = [('Home', 'home'), ('Who We Are', 'who-we-are'), ('How It Works', 'how-it-works'), ('Financial Engine', 'engine'),
       ('Platforms & Institutions', 'platforms'), ('SMEs & Projects', 'smes'), ('Investors & Partners', 'investors'),
       ('Insights', 'insights'), ('Start a Conversation', 'start'), ('Governance', 'governance'), ('Corporate / IR', 'corporate'),
       ('Contact', 'contact'), ('Verify a Communication', 'verify')]

ALL = [(s[0], s[1]) for s in SCREENS] + [(k, v[0] + ' · ' + v[2].lower()) for k, v in PLACEHOLDERS.items()]

# ---------------------------------------------------------------- extract
extracted = {}   # (src,id) -> (html, width)
styles = {}      # src -> (css, [font links])
needed = {}
for s in SCREENS:
    for i in s[4] + s[5]:
        needed.setdefault(s[3], set()).add(i)

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 2400, 'height': 1400})
    for src, ids in needed.items():
        pg.goto(f'file://{S}/render/{src}.html'); pg.wait_for_selector('body[data-ready]', timeout=15000)
        css = pg.evaluate("()=>[...document.querySelectorAll('style')].map(s=>s.textContent).join('\\n')")
        links = pg.evaluate("()=>[...document.querySelectorAll('link[href*=\"fonts.googleapis.com/css\"]')].map(l=>l.href)")
        styles[src] = (css, links)
        for i in ids:
            h, w = pg.evaluate("""(i)=>{const o=document.getElementById(i).cloneNode(true);o.querySelector('.dv-olabel')?.remove();
               o.querySelectorAll('*').forEach(e=>{[...e.attributes].forEach(a=>{if(/^on/i.test(a.name))e.removeAttribute(a.name)})});
               return [o.innerHTML, Math.round(document.getElementById(i).getBoundingClientRect().width)]}""", i)
            h = h.replace('BWCI PLC', 'Better World Capital Investments PLC')
            extracted[(src, i)] = (h, w)
    b.close()

# ---------------------------------------------------------------- templates
def esc(t): return html.escape(t, quote=True)

def options_html(cur, mode):
    return ''.join(f'<option value="{k}.html"{" selected" if k == cur else ""}>{esc(t)}</option>' for k, t in ALL)

def chrome(cur, mode, title, url):
    other = 'mobile' if mode == 'desktop' else 'desktop'
    return f'''<header class="pt-bar" role="banner">
  <a class="pt-brand" href="../index.html" title="All screens">BWCI <b>Next Version</b> <span>wireframes</span></a>
  <span class="pt-draft">DRAFT · internal review only · not a financial promotion</span>
  <select class="pt-select" aria-label="Go to screen" onchange="location.href=this.value">{options_html(cur, mode)}</select>
  <span class="pt-seg"><a class="{'on' if mode=='desktop' else ''}" href="../desktop/{cur}.html">Desktop</a><a class="{'on' if mode=='mobile' else ''}" href="../mobile/{cur}.html">Mobile</a></span>
  <button class="pt-btn" id="pt-links" type="button" aria-pressed="false" title="Highlight clickable areas">Links</button>
  <button class="pt-btn" id="pt-notes" type="button" aria-pressed="false" title="Show the designer’s annotation column">Notes</button>
</header>
<div class="pt-crumb"><span>{esc(title)}</span><code>{esc(url)}</code></div>'''

def menu_html():
    items = ''.join(f'<a href="{k}.html">{esc(t)}</a>' for t, k in NAV)
    return f'<div class="pt-menu" id="pt-menu" hidden><div class="pt-menu-in"><button type="button" class="pt-menu-x" aria-label="Close menu">✕</button><nav>{items}</nav><p>Prototype menu · the wireframe’s own open-menu state is shown in Notes view.</p></div></div>'

HEAD = '''<!doctype html><html lang="en-GB"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive">
<title>{title} · BWCI wireframes ({mode})</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
{links}
<link rel="stylesheet" href="../assets/proto.css">
<style>{css}</style></head>'''

def page(slug, title, url, mode, body, core, src_css='', links=()):
    lk = '\n'.join(f'<link rel="stylesheet" href="{esc(l)}">' for l in links)
    return (HEAD.format(title=esc(title), mode=mode, links=lk, css=src_css) +
            f'<body class="pt pt-{mode}" data-core="{core}">' + chrome(slug, mode, title, url) +
            f'<main class="pt-stage"><div class="pt-fit" id="pt-fit">{body}</div></main>' + menu_html() +
            f'<script>window.PT_RULES={json.dumps(RULES)};</script><script src="../assets/proto.js"></script></body></html>')

CORE = {'desktop': 1282, 'mobile': 392}

for slug, title, url, src, d_ids, m_ids in SCREENS:
    css, links = styles[src]
    for mode, ids in (('desktop', d_ids), ('mobile', m_ids)):
        parts = []
        for i in ids:
            h, w = extracted[(src, i)]
            lab = f'<div class="pt-optlabel">{esc(ENGINE_LABELS[i])}</div>' if slug == 'engine' and mode == 'desktop' else ''
            parts.append(f'{lab}<div class="pt-board" data-w="{w}">{h}</div>')
        if slug == 'engine':
            note = ('<div class="pt-note">Signature visual only (not the full page). Option C removed after review. '
                    'Palette is provisional — final build uses the BWCI palette (Deep Engine Ink #123039, #12836B, #B98F2D).</div>')
            parts.insert(0, note)
        core = CORE[mode] if slug != 'engine' else (1280 if mode == 'desktop' else 378)
        open(f'{OUT}/{mode}/{slug}.html', 'w').write(page(slug, title, url, mode, ''.join(parts), core, css, links))

for slug, (title, url, status, sections, note) in PLACEHOLDERS.items():
    for mode in ('desktop', 'mobile'):
        lis = ''.join(f'<li>{esc(x)}</li>' for x in sections)
        nav = ''.join(f'<a href="{k}.html">{esc(t)}</a>' for t, k in NAV[1:9])
        body = f'''<div class="pt-board ph" data-w="{CORE[mode]}"><div class="ph-head"><a href="home.html" class="ph-logo">BWCI</a><nav class="ph-nav">{nav}</nav><button class="ph-burger" type="button" data-href="#menu">≡</button></div>
<div class="ph-body"><div class="ph-crumb"><a href="home.html">Home</a> › {esc(title)}</div><span class="ph-status">{esc(status)}</span>
<h1>{esc(title)}</h1><p class="ph-url">{esc(url)}</p><h2>Planned content (sitemap v2)</h2><ul>{lis}</ul>{f'<p class="ph-note">{esc(note)}</p>' if note else ''}
<p class="ph-back"><a href="home.html">← Back to the homepage</a></p></div></div>'''
        open(f'{OUT}/{mode}/{slug}.html', 'w').write(page(slug, title, url, mode, body, CORE[mode]))

# ---------------------------------------------------------------- index
rows = ''.join(f'<tr><td>{esc(t)}</td><td><code>{esc(u)}</code></td><td><a href="desktop/{k}.html">Desktop</a></td><td><a href="mobile/{k}.html">Mobile</a></td></tr>' for k, t, u, *_ in SCREENS)
prow = ''.join(f'<tr class="muted"><td>{esc(v[0])}</td><td><code>{esc(v[1])}</code></td><td colspan="2">{esc(v[2])}</td></tr>' for v in PLACEHOLDERS.values())
idx = f'''<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive"><title>BWCI Next Version · Wireframe prototypes</title>
<link rel="stylesheet" href="assets/proto.css"></head><body class="pt-index">
<main class="ix"><p class="ix-draft">DRAFT · internal review only · not a financial promotion · not for distribution</p>
<h1>BWCI — Next Version</h1><p class="ix-sub">Linked wireframe prototypes · information architecture &amp; core design system · October 2026</p>
<div class="ix-cards"><a class="ix-card" href="desktop/home.html"><b>Desktop prototype</b><span>1280 px layouts · open on a laptop or desktop</span></a>
<a class="ix-card" href="mobile/home.html"><b>Mobile prototype</b><span>390 px layouts · open on a phone</span></a></div>
<h2>How to use</h2><ul class="ix-how"><li>Click navigation, buttons and “→” links as a visitor would. Press <b>Links</b> to see every clickable area.</li>
<li>Switch between <b>Desktop</b> and <b>Mobile</b> on any screen from the top bar; the screen menu jumps anywhere.</li>
<li><b>Notes</b> shows the designer’s annotation column where a wireframe has one.</li>
<li>These are wireframes: structure and content order, not final visual design. Fonts, colours and imagery are placeholders. Items marked ⚠ need confirmation.</li></ul>
<h2>Screens</h2><table class="ix-t"><thead><tr><th>Screen</th><th>URL (sitemap v2)</th><th colspan="2">Open</th></tr></thead><tbody>{rows}{prow}</tbody></table>
</main></body></html>'''
open(f'{OUT}/index.html', 'w').write(idx)
shutil.copy(f'{S}/tools/proto.css', f'{OUT}/assets/proto.css')
shutil.copy(f'{S}/tools/proto.js', f'{OUT}/assets/proto.js')
print('screens', len(SCREENS), 'placeholders', len(PLACEHOLDERS), 'files', sum(len(f) for _, _, f in os.walk(OUT)))
