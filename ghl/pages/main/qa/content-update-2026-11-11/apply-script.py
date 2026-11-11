# Dev-only record of the 11 November 2026 edit (already applied; re-running fails its checks).
# usage: python3 apply-script.py <ghl file>     (after apply-markup.py, for main.ghl.html and main.inline.ghl.html)
# Script and config changes for the owner's live Home content and the "Why now, why us" bridge (one Main file).
import re, sys
F = sys.argv[1]
s = open(F, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    c = s.count(a); assert c == n, (c, a[:100]); s = s.replace(a, b)
def rep_re(pat, b):
    global s
    m = re.findall(pat, s, flags=re.S); assert len(m) == 1, (len(m), pat[:80]); s = re.sub(pat, lambda _: b, s, flags=re.S)

# ---------------- config ----------------
rep('    "today": "#bwci-today",\n', '    "today": "{{ custom_values.bwci_url_platform_today }}",\n')
for k in ['governanceCommittees', 'governanceCapital', 'governanceRisk', 'platformsRegisters']:
    rep_re(r'\n    "' + k + r'": "[^"]*",', '')
rep('    "betterWorldImpact": "{{ custom_values.bwci_url_better_world_impact }}"\n  }',
    '    "betterWorldImpact": "{{ custom_values.bwci_url_better_world_impact }}",\n'
    '    "profileAlexanderAlegriaSaif": "{{ custom_values.bwci_url_profile_alexander_alegria_saif }}",\n'
    '    "profileFarhadReyazat": "{{ custom_values.bwci_url_profile_farhad_reyazat }}",\n'
    '    "profileGabriellaKarlova": "{{ custom_values.bwci_url_profile_gabriella_karlova }}",\n'
    '    "providenceAssetManagement": "{{ custom_values.bwci_url_providence_asset_management }}",\n'
    '    "platformToday": "{{ custom_values.bwci_url_platform_today }}"\n  }')
rep('  "showFooter": true,\n', '  "showFooter": true,\n  "showWhyFlags": true,\n')

# ---------------- 05 · engine data (the owner's text; no illustrative examples) ----------------
rep_re(r'  var STEPS = \[\n.*?\n  \];\n', """  var STEPS = [
    ['Economic Need', 'We start with what an organization or project needs to grow, operate, or invest before considering any financial product.'],
    ['Financial Architecture', 'We then design the financial structure around that need: the form, terms, and capital ownership that fit the activity.'],
    ['Appropriate Institution / Delivery Capability', 'Next, we identify the institution or delivery capability best placed to provide that system, within the platform or through a partner.'],
    ['Capital', 'Capital is then matched to the structure, from sources whose terms and time horizon suit the activity.'],
    ['Productive Economic Activity', 'The capital is put to work in productive activity: the business operates, trades, employs, and builds.'],
    ['Performance / Learning / Reinvestment', 'Performance is reviewed, lessons are recorded, and capital and insight are reinvested to meet the next need.']
  ];
""")
rep_re(r"    ex: function \(st\) \{ return '<div class=\"lpd-ex\">.*?'; \},\n", "    ex: function () { return ''; }, // the owner's page has no illustrative examples\n")

# ---------------- 06 · platforms data, filters and card (the owner's five parts) ----------------
rep_re(r'  var P = \[\n.*?\n  \];\n', """  var P = [
    { name: 'Providence Asset Management', b: 'op', reg: 'The group’s asset management company. Any investment management is carried out by this entity, within its regulatory permissions.' },
    { name: 'Strategic Partner Capabilities', b: 'op', reg: 'Specialist financial, technical and operational capabilities provided by independent, authorised partner institutions.' },
    { name: 'Private Capital Platform', b: 'dev', reg: 'Being designed to structure private debt and growth capital for established businesses.' },
    { name: 'Trade Finance Platform', b: 'dev', reg: 'Designed to support trade flows and the working capital needs of productive businesses.' },
    { name: 'Financial Infrastructure', b: 'dev', reg: 'Long-term financial infrastructure serving productive economic activity.' }
  ];
""")
rep_re(r'  var IC = \{\n.*?\n  \};\n', '')
rep_re(r'  var STG = \{[^\n]*\};\n', '')
rep_re(r"  var STAGE_C = \{[^\n]*\};\n", "  var STAGE_C = { op: 'var(--status-op-mark)', dev: 'var(--status-dev-mark)' };\n  var STATUS = { op: 'Operating now', dev: 'In development' };\n")
rep_re(r"  var FIL = \[\[[^\n]*\]\];\n", "  var FIL = [['all', 'All', 'var(--brand-ink)'], ['op', 'Operating now', 'var(--status-op-mark)'], ['dev', 'In development', 'var(--status-dev-mark)']];\n")
rep("    cardCls: function (p) { return 'pk pk--' + p.v; },", "    cardCls: function () { return 'pk pk--build'; },")
rep_re(r"    cardInner: function \(p\) \{\n.*?\n    \},\n    card: function", """    cardInner: function (p) {
      return '\\n                                <span class="pk-bar" aria-hidden="true"></span>\\n' +
        '                                <div class="pk-top"><span class="bw-badge bw-b-' + p.b + '"><i></i>' + ip(STATUS[p.b]) + '</span></div>\\n' +
        '                                <div class="pk-hd"><h3>' + ip(p.name) + '</h3></div>\\n' +
        '                                <div class="pk-more"><p class="pk-reg">' + ip(p.reg) + '</p></div>\\n' +
        '                                <span class="pk-go">View in directory <span class="bw-ar" aria-hidden="true">→</span></span>\\n                            ';
    },
    card: function""")
rep_re(r"    shownLabel: function \(pf\) \{\n.*?\n    \}\n  \};", """    shownLabel: function (pf) {
      if (pf === 'all') return 'Shown in this view';
      return pf === 'op' ? 'Parts operating now' : 'Parts in development';
    }
  };""")
# the owner's "bw-platform-copy" class stays on the block when the filter changes
rep("          pfx.className = 'pfx rv' + (pf === 'all' ? ' bw-is-all' : '') + (pfx.classList.contains('bw-in') ? ' bw-in' : '');",
    "          pfx.className = 'pfx rv' + (pf === 'all' ? ' bw-is-all' : '') + ' bw-platform-copy' + (pfx.classList.contains('bw-in') ? ' bw-in' : '');")
rep("          // source className: 'pfx rv' + is-all + in (the reveal state is kept across filter changes)",
    "          // source className: 'pfx rv' + is-all + in (the reveal state is kept across filter changes), plus the owner's bw-platform-copy")

# ---------------- 02 · why now, why us ----------------
rep("  var OPTIONS = {", """  var OPTIONS = {
    whyMq: '(max-width:899px)',  // "Why now" bridge: below this the lines run vertically between stacked panels
    whyStart: 0.88,               // build progress 0 → 1 while the bridge's top moves from 88 % of the viewport...
    whyTravel: 0.26,              // ...over its own height plus 26 % of the viewport; it never goes back
    whyKick: 600,                 // ms after load: one more progress check
    whyCleanup: 450,              // ms after completion: the scroll-linked state is removed""")
rep("    /* ================= 01 · HERO \"AT A GLANCE\" FACTS ================= */", """    /* ================= 02 · WHY NOW, WHY US (design export 04715d6) =================
       Source prop whyFlags (default true): the "Awaiting sign-off" / "Verify figure" / "Legal check" badges; only a
       boolean false hides them. The bridge (source initBridge): the connecting curves are drawn to the layout's real
       pixel size (redrawn on resize), and the panels, lines and core build with the scroll, forward only; once complete,
       pulses run along the lines and the core glows once. Reduced motion, or no IntersectionObserver-era APIs needed:
       everything is shown at once. A copied live root starts from the source's initial state. */
    qa('[data-bw-why-flag]').forEach(function (el) { el.hidden = cfg.showWhyFlags === false; });
    var br = q('.wy-br');
    if (br) {
      (function () {
        br.classList.remove('is-geo', 'is-done', 'wy-live');
        br.style.removeProperty('--p');
        var mq = window.matchMedia ? window.matchMedia(OPTIONS.whyMq) : { matches: false };
        function A(el, o) { if (el) Object.keys(o).forEach(function (k) { el.setAttribute(k, o[k]); }); }
        function geo() {
          var mob = mq.matches;
          Array.prototype.forEach.call(br.querySelectorAll('.wy-flow svg'), function (sv) {
            var w = sv.clientWidth, h = sv.clientHeight; if (!w || !h) return;
            var R = sv.parentNode.classList.contains('wy-flow--r');
            A(sv, { viewBox: '0 0 ' + w + ' ' + h, preserveAspectRatio: 'xMidYMid meet' });
            var c = h / 2, k = w * 0.56, ys = [h / 6, c, h * 5 / 6];
            var ds = mob ? ['M' + (w / 2) + ' 0V' + h, 'M0 0', 'M0 0'] : ys.map(function (y) {
              return R ? 'M0 ' + c + 'C' + k + ' ' + c + ' ' + (w - k) + ' ' + y + ' ' + w + ' ' + y : 'M0 ' + y + 'C' + k + ' ' + y + ' ' + (w - k) + ' ' + c + ' ' + w + ' ' + c;
            });
            Array.prototype.forEach.call(sv.querySelectorAll('.wy-base'), function (p, i) { p.setAttribute('d', ds[i]); });
            Array.prototype.forEach.call(sv.querySelectorAll('.wy-pulse'), function (p, i) { p.setAttribute('d', ds[i]); });
            var so = sv.querySelectorAll('.wy-so'), port = sv.querySelector('.wy-port'), g = sv.querySelector('linearGradient');
            if (mob) { A(so[0], { cx: w / 2, cy: R ? h : 0 }); A(port, { cx: w / 2, cy: R ? 0 : h }); A(g, { x1: 0, y1: R ? h : 0, x2: 0, y2: R ? 0 : h }); }
            else { Array.prototype.forEach.call(so, function (el, i) { A(el, { cx: R ? w : 0, cy: ys[i] }); }); A(port, { cx: R ? 0 : w, cy: c }); A(g, { x1: R ? w : 0, y1: 0, x2: R ? 0 : w, y2: 0 }); }
          });
          br.classList.add('is-geo');
        }
        if (typeof ResizeObserver === 'function') { var bro = new ResizeObserver(geo); bro.observe(br); observers.push(bro); }
        geo();
        if (prefersReducedMotion()) { br.classList.add('is-done'); return; }
        br.classList.add('wy-live');
        var p = 0;
        function off() {
          document.removeEventListener('scroll', onScroll, true);
          window.removeEventListener('resize', onScroll);
          cancelAnimationFrame(timers.wyRaf); timers.wyRaf = 0;
        }
        function calc() {
          timers.wyRaf = 0;
          var r = br.getBoundingClientRect(), vh = window.innerHeight || 800;
          if (!r.height) return;
          var se = document.scrollingElement || document.documentElement;
          var v = se.scrollHeight <= vh + 4 ? 1 : Math.max(0, Math.min(1, (vh * OPTIONS.whyStart - r.top) / (r.height + vh * OPTIONS.whyTravel)));
          if (v > p) { p = v; br.style.setProperty('--p', p.toFixed(3)); }
          if (p >= 1) {
            off(); br.classList.add('is-done');
            timers.wyDone = setTimeout(function () { br.classList.remove('wy-live'); br.style.removeProperty('--p'); }, OPTIONS.whyCleanup);
          }
        }
        function onScroll() { if (!timers.wyRaf) timers.wyRaf = requestAnimationFrame(calc); }
        on(document, 'scroll', onScroll, { capture: true, passive: true });
        on(window, 'resize', onScroll);
        calc();
        timers.wyKick = setTimeout(onScroll, OPTIONS.whyKick);
      })();
    }

    /* ================= 01 · HERO "AT A GLANCE" FACTS ================= */""")
rep("        ['tabs', 'snap', 'dragClick', 'ix'].forEach(function (k) { clearTimeout(timers[k]); });\n        cancelAnimationFrame(timers.engRaf);",
    "        ['tabs', 'snap', 'dragClick', 'ix', 'wyKick', 'wyDone'].forEach(function (k) { clearTimeout(timers[k]); });\n        cancelAnimationFrame(timers.engRaf);\n        cancelAnimationFrame(timers.wyRaf);")
open(F, 'w', encoding='utf-8').write(s)
print('ok', F)
