# Applies the owner's live Home markup and the design's "Why now, why us" section to one Main output file.
# Dev-only record of the 11 November 2026 edit (already applied; re-running on an updated file fails its checks).
# usage: python3 apply-markup.py <repo> <ghl file>     (run for main.ghl.html and main.inline.ghl.html)
import re, sys, json
REPO, F = sys.argv[1], sys.argv[2]
import os
SP = os.path.dirname(os.path.abspath(__file__)) + '/'
s = open(F, encoding='utf-8').read()
design = open(REPO + '/design/Main.dc.html', encoding='utf-8').read()
owner = open(SP + 'owner-markup.html', encoding='utf-8').read()

def one(hay, a, label):
    n = hay.count(a)
    assert n == 1, (label, n, a[:90])

# ---------------- owner markup: hrefs back to "#" (the runtime sets them from the config) ----------------
owner = re.sub(r'href="(?!#)[^"]*"( data-bw-link=)', r'href="#"\1', owner)
PROFILE = {'/alexander-alegria-seif': 'profileAlexanderAlegriaSaif', '/farhad-reyazat': 'profileFarhadReyazat', '/gabriella-karlova': 'profileGabriellaKarlova'}
for h, k in PROFILE.items():
    a = 'class="ld-p rv" href="' + h + '"'
    one(owner, a, 'profile ' + h)
    owner = owner.replace(a, 'class="ld-p rv" href="#" data-bw-link="' + k + '"')
assert not re.search(r'href="/', owner), 'hard-coded href left'

# ---------------- design: "02 WHY NOW, WHY US" ----------------
i = design.index('  <!-- 02 WHY NOW, WHY US -->'); j = design.index('  <!-- 03 PROBLEM -->')
why = re.sub(r'(?m)^[ \t]+$', '', design[i:j].rstrip() + '\n')  # the design's whitespace-only line
why = re.sub(r'<sc-if value="\{\{ whyFlags \}\}" hint-placeholder-val="\{\{ true \}\}"><span class="wy-flag">', '<span class="wy-flag" data-bw-why-flag>', why)
why = why.replace('</span></sc-if>', '</span>')
assert 'sc-if' not in why and '{{' not in why
CLS = {'sec': 'bw-sec', 'sec--subtle': 'bw-sec--subtle', 'wrap': 'bw-wrap', 'h1': 'bw-h1', 'link': 'bw-link', 'ar': 'bw-ar'}
def cls_attr(m):
    return 'class="' + ' '.join(CLS.get(c, c) for c in m.group(1).split()) + '"'
why = re.sub(r'class="([^"]*)"', cls_attr, why)
IDS = {'why': 'bwci-why', 'wy-need': 'bwci-wy-need', 'wy-cap': 'bwci-wy-cap', 'wyGl': 'bwci-wyGl', 'wyGr': 'bwci-wyGr'}
for a, b in IDS.items():
    why = why.replace('id="' + a + '"', 'id="' + b + '"').replace('aria-labelledby="' + a + '"', 'aria-labelledby="' + b + '"').replace('url(#' + a + ')', 'url(#' + b + ')')
LINKS = {'Profile%20Farhad%20Reyazat.dc.html': 'profileFarhadReyazat', 'Profile%20Alexander%20Alegria%20Saif.dc.html': 'profileAlexanderAlegriaSaif',
         'Providence%20Asset%20Management.dc.html': 'providenceAssetManagement', 'Platform%20Today.dc.html': 'platformToday'}
for h, k in LINKS.items():
    one(why, 'href="' + h + '"', 'why link ' + h)
    why = why.replace('href="' + h + '"', 'href="#" data-bw-link="' + k + '"')
assert '.dc.html' not in why
why = why.replace('<!-- 02 WHY NOW, WHY US -->', '<!-- 02 WHY NOW, WHY US (design export 04715d6; badges: "showWhyFlags") -->')

# ---------------- design CSS for the section ----------------
i = design.index('/* 02 why now, why us */'); j = design.index('</style>', i)
css = design[i:j].rstrip() + '\n'
KF = {'wyPulseIn': 'bw-wyPulseIn', 'wyPulseBack': 'bw-wyPulseBack', 'wyGlow': 'bw-wyGlow'}
def sel(t):
    t = re.sub(r'\.([a-zA-Z][\w-]*)', lambda m: '.' + CLS.get(m.group(1), m.group(1)), t)
    t = re.sub(r'#([a-zA-Z][\w-]*)', lambda m: '#' + ({'problem': 'bwci-problem'}.get(m.group(1), IDS.get(m.group(1), m.group(1)))), t)
    return ', '.join('#bwci-main-page ' + p.strip() for p in t.split(','))
out = ''; pos = 0; buf = ''; stack = []
while pos < len(css):
    c = css[pos]
    if css.startswith('/*', pos):
        e = css.index('*/', pos) + 2; out += buf + css[pos:e]; buf = ''; pos = e; continue
    if c == '{':
        pre = buf; buf = ''; pos += 1
        lead = pre[:len(pre) - len(pre.lstrip())]; p = pre.strip()
        if p.startswith('@keyframes'):
            name = p.split()[1]; e = pos; depth = 1
            while depth:
                if css[e] == '{': depth += 1
                elif css[e] == '}': depth -= 1
                e += 1
            out += lead + '@keyframes ' + KF[name] + '{' + css[pos:e]; pos = e; continue
        if p.startswith('@'):
            stack.append('at'); out += lead + p + '{'; continue
        e = css.index('}', pos)
        body = css[pos:e]
        for a, b in KF.items(): body = re.sub(r'(?<![\w-])' + a + r'\b', b, body)
        out += lead + sel(p) + '{' + body + '}'; pos = e + 1; continue
    if c == '}':
        out += buf + '}'; buf = ''; stack.pop(); pos += 1; continue
    buf += c; pos += 1
out += buf
for a in KF: assert re.search(r'(?<![\w-])' + a + r'\b', out) is None, a
assert '#why' not in out and '#problem' not in out

# ---------------- apply to the Main file ----------------
# 1. CSS: the section's rules after the page's own CSS (before the shared header CSS), and the two owner classes
marker = '/* ---- SiteHeader'
k = s.find(marker)
if k < 0:
    # fall back: before the first header rule
    k = s.index('#bwci-main-page .bw-hdr')
    k = s.rfind('\n', 0, k) + 1
OWNER_CSS = """/* owner's live page (11 November 2026): text shown on desktop or on a phone, and the platform descriptions shown in the
   "All" view of the Platforms cards */
#bwci-main-page .bw-copy-mobile{ display:none; }
@media (max-width:767px){ #bwci-main-page .bw-copy-desktop{ display:none; } #bwci-main-page .bw-copy-mobile{ display:inline; } }
#bwci-main-page .pfx.bw-platform-copy .pk-more{ display:block; }
"""
s = s[:k] + OWNER_CSS + out + s[k:]

# 2. markup: everything from the hero to the end of the final CTA becomes the owner's, plus the new section
a = s.index('  <section class="bw-hero" id="bwci-hero"')
b = s.index('</section>', s.index('<section class="bw-cta" id="bwci-cta"')) + len('</section>')
problem_at = owner.index('    <section class="bw-sec" id="bwci-problem"')
s = s[:a] + owner[:problem_at] + why + '\n' + owner[problem_at:].rstrip() + s[b:]

open(F, 'w', encoding='utf-8').write(s)
print('ok', F, len(out), 'css chars', len(why), 'why chars')
