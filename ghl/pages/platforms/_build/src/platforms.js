/* BWCI — Platforms, Institutions & Connected Capabilities · GoHighLevel runtime (vanilla JS, no dependencies).
   Replaces the Claude Design runtime (support.js + React) used by the Platforms design page and its
   SiteHeader component. Everything is scoped to #bwci-platforms. */
(function () {
  'use strict';

  /* Editable settings (hero image URL, header/footer toggles, URL sync, page links) live in the
     <script type="application/json" id="bwci-platforms-config"> block at the very top of the Custom
     Code paste, not here. */

  /* ======================= BEHAVIOUR (source values) ======================= */
  var OPTIONS = {
    headerDesktopMin: 1200,   // header switches to burger/drawer below this width
    jumpOffset: 88,           // register jump: directory toolbar lands this far below the viewport top
    backOffset: 64,           // "Back to registers": registers section lands this far below the top
    revealThreshold: 0.15
  };

  var ROOT_ID = 'bwci-platforms';
  var CONFIG_ID = 'bwci-platforms-config';
  var INSTANCE_KEY = '__bwciPlatforms';

  /* VIEW:start — directory data and markup. _build/build.js also runs this part to write the
     default-state markup into the page, so the static HTML and the script always agree. */
  var STAGES = ['Identify Need', 'Engineer Solution', 'Connect Capability', 'Mobilise Capital', 'Activate', 'Learn', 'Scale'];
  var MG = { 'Operating': 'op', 'In Development': 'dev', 'Proposed': 'prop' };
  var LBL = { 'All': 'All', 'Operating': 'Operating', 'In Development': 'In development', 'Proposed': 'Proposed', 'Group Company': 'Group company', 'Group Build': 'Group build', 'Partner Capability': 'Partner capability', 'Enabling Layer': 'Enabling layer' };
  var RG = { 'Group Company': 'gc', 'Group Build': 'gb', 'Partner Capability': 'pc', 'Enabling Layer': 'en' };
  var CAPS = [
    { name: 'Providence Asset Management', mat: 'Operating', rel: 'Group Company', stages: [3, 4], short: 'The group’s asset management company.', mandate: 'An asset management business focused on private-market strategies that invest in productive, real-economy activity.', perimeter: 'Providence Asset Management Ltd*', avail: 'Operating today, within the entity’s regulatory permissions.', cta: 'View platform' },
    { name: 'Strategic Partner Capabilities', mat: 'Operating', rel: 'Partner Capability', stages: [3, 5], short: 'Capabilities delivered by independent partner institutions.', mandate: 'Specialist capabilities provided by vetted, independent institutions. Each partner operates under its own authorisation and on its own balance sheet.', perimeter: 'Independent partner institutions, each named at the point of engagement.', avail: 'Available today through partners and delivered under each partner’s own permissions.', cta: 'View partner capabilities' },
    { name: 'Private Capital Platform', mat: 'In Development', rel: 'Group Build', stages: [2, 4], short: 'Private debt and growth equity, in development.', mandate: 'A platform being designed to structure private debt and growth equity for productive businesses, working alongside authorised partners.', perimeter: 'BWCI group build. No operating entity yet.', avail: 'In development. Not currently offered as a service.', cta: 'Follow its development' },
    { name: 'Financial Infrastructure', mat: 'In Development', rel: 'Enabling Layer', stages: [2, 5], short: 'Shared technology and compliance infrastructure.', mandate: 'Shared technology, data and compliance tools designed to support the group’s platforms and partner connections, so each platform does not have to build its own.', perimeter: 'Internal group capability.', avail: 'Internal infrastructure only. Not a client-facing service.', cta: 'Explore the enabling layer' },
    { name: 'Trade Finance Platform', mat: 'In Development', rel: 'Group Build', stages: [4, 5], short: 'Trade and working-capital finance, in development.', mandate: 'A platform being designed to help address the working-capital gap facing productive exporters and supply chains, working with authorised partners.', perimeter: 'BWCI group build. No operating entity yet.', avail: 'In development. Not currently offered as a service.', cta: 'Follow its development' },
    { name: 'Community Banking Institution', mat: 'Proposed', rel: 'Group Build', stages: [4, 5], short: 'A stated long-term ambition, subject to authorisation.', mandate: 'A long-term intention to establish a relationship-based community bank serving regional businesses. This would require authorisation from the Prudential Regulation Authority (PRA) and regulation by the Financial Conduct Authority (FCA) and the PRA.', perimeter: 'No entity exists. Any future entity would be subject to authorisation.', avail: 'Proposed only. Not operating and not accepting deposits or making loans.', cta: 'Read the ambition' }
  ];
  var MAT_OPTS = [['All', 'All maturities'], ['Operating', 'Operating'], ['In Development', 'In development'], ['Proposed', 'Proposed']];
  var REL_OPTS = [['All', 'All relationships'], ['Group Company', 'Group company'], ['Group Build', 'Group build'], ['Partner Capability', 'Partner capability'], ['Enabling Layer', 'Enabling layer']];
  var MIX_KEYS = ['Operating', 'In Development', 'Proposed'];

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;'; });
  }
  // {{…}} text in the source is wrapped by its runtime in span.sc-interp (mobile CSS sizes it); plt-i reproduces it
  function ip(s) { return '<span class="plt-i">' + esc(s) + '</span>'; }
  function glyph(k) { return '<span class="plt-g plt-g-' + k + '"></span>'; }
  function matOk(c, m) { return m === 'All' || c.mat === m; }
  function relOk(c, r) { return r === 'All' || c.rel === r; }
  function tagCls(c) { return 'plt-tag' + (c.rel === 'Partner Capability' ? ' plt-tag--pc' : ''); }
  function role(c) { return c.stages.map(function (n) { return STAGES[n - 1]; }).join(' · '); }
  function listFor(S) { return CAPS.filter(function (c) { return matOk(c, S.mat) && relOk(c, S.rel); }); }
  function isFocus(S, c) { return !!(S.jump && S.jump.single && S.jump.name === c.name); }
  function countMat(k) { return CAPS.filter(function (c) { return c.mat === k; }).length; }
  function chipCount(key, k, S) {
    return CAPS.filter(function (c) { return key === 'mat' ? matOk(c, k) && relOk(c, S.rel) : relOk(c, k) && matOk(c, S.mat); }).length;
  }

  var VIEW = {
    count: function (n) { return ip(String(n)); },
    rxLinks: function (keys) {
      return keys.map(function (k) {
        return '<button type="button" class="rx-link" data-plt-go="mat" data-plt-key="' + esc(k) + '">' + glyph(MG[k]) + ip(LBL[k]) + ' · ' + ip(String(countMat(k))) + ' <i aria-hidden="true">↓</i></button>';
      }).join('');
    },
    tiles: function (register) {
      return CAPS.map(function (c, i) {
        if ((c.mat === 'Operating') !== (register === 1)) return '';
        return '\n                <button type="button" class="rx-tile rx-tile--' + MG[c.mat] + '" aria-label="Show ' + esc(c.name) + ' in the directory" data-plt-go="cap" data-plt-key="' + i + '">' +
          '\n                  <span class="rx-st">' + glyph(MG[c.mat]) + ip(LBL[c.mat]) + '</span>' +
          '\n                  <span class="rx-name">' + ip(c.name) + '</span>' +
          '\n                  <span class="rx-desc">' + ip(c.short) + '</span>' +
          '\n                  <span class="rx-foot"><span class="' + tagCls(c) + '">' + glyph(RG[c.rel]) + ip(LBL[c.rel]) + '</span><span class="rx-go">View in directory <i aria-hidden="true">↓</i></span></span>' +
          '\n                </button>';
      }).join('') + '\n              ';
    },
    mixBar: function (S) {
      var list = listFor(S);
      return CAPS.map(function (c) { return '<i class="plt-' + MG[c.mat] + (list.indexOf(c) < 0 ? ' plt-dim' : '') + '" style="flex:1"></i>'; }).join('');
    },
    mix: function (S) {
      return MIX_KEYS.map(function (k) {
        return '<button type="button" class="mx-btn" aria-pressed="' + (S.mat === k) + '" data-plt-mix="' + esc(k) + '"><span>' + glyph(MG[k]) + ip(LBL[k]) + '</span><b>' + ip(String(countMat(k))) + '</b></button>';
      }).join('');
    },
    chips: function (key, S) {
      return (key === 'mat' ? MAT_OPTS : REL_OPTS).map(function (o) {
        var n = chipCount(key, o[0], S);
        var g = key === 'mat' ? MG[o[0]] : RG[o[0]];
        return '<button type="button" class="plt-chip' + (n === 0 ? ' plt-chip--zero' : '') + '" aria-pressed="' + (S[key] === o[0]) + '" data-plt-' + key + '="' + esc(o[0]) + '">' +
          glyph(g || 'none') + ip(o[1]) + '<span class="plt-chip__n">' + ip(String(n)) + '</span></button>';
      }).join('');
    },
    af: function (f) {
      return '<button type="button" class="af" aria-label="Remove ' + esc(f.value) + ' filter" data-plt-af="' + f.key + '">' + ip(LBL[f.value]) + '<i aria-hidden="true">×</i></button>';
    },
    tbRes: function (S) {
      var h = '<span>Showing</span><b>' + ip(String(listFor(S).length)) + ' of ' + ip(String(CAPS.length)) + '</b>';
      activeFilters(S).forEach(function (f) { h += VIEW.af(f); });
      if (S.mat !== 'All' || S.rel !== 'All') h += '<button type="button" class="af af--clear" data-plt-clear>Clear all</button>';
      return h;
    },
    jump: function (S) {
      var J = S.jump;
      // line breaks as in the source template: they keep the status text readable when announced
      return '<div class="jb" role="status" data-plt-jump>\n' +
        '<span class="jb-ic" aria-hidden="true">↓</span>\n' +
        '<div class="jb-tx"><small>From the two-register map</small><span>' + ip(J.single ? 'Showing' : 'Showing all') + ' <b>' + ip(J.name) + '</b> · filtered by ' + ip(J.filter) + '</span></div>\n' +
        '<div class="jb-act">\n' +
        '<button type="button" class="jb-btn" data-plt-jb="back"><span aria-hidden="true">↑</span> Back to registers</button>\n' +
        '<button type="button" class="jb-btn" data-plt-jb="clear">Show all platforms</button>\n' +
        '<button type="button" class="jb-btn jb-btn--x" aria-label="Dismiss" data-plt-jb="dismiss">×</button>\n' +
        '</div>\n</div>';
    },
    card: function (c, i, S) {
      var ticks = STAGES.map(function (s, j) {
        return '<span' + (c.stages.indexOf(j + 1) >= 0 ? ' class="plt-on"' : '') + ' title="' + esc(s) + '">' + ip((j < 9 ? '0' : '') + (j + 1)) + '</span>';
      }).join('');
      return '<article class="pd pd--' + MG[c.mat] + (isFocus(S, c) ? ' pd--focus' : '') + '" style="animation-delay:' + (i * 60) + 'ms" data-plt-cap="' + CAPS.indexOf(c) + '">' +
        '<div class="pd-top">' +
        '<div class="pd-tags">' +
        '<span class="plt-tag plt-tag--' + MG[c.mat] + '">' + glyph(MG[c.mat]) + ip(c.mat) + '</span>' +
        '<span class="' + tagCls(c) + '">' + glyph(RG[c.rel]) + ip(c.rel) + '</span>' +
        '<span class="pd-date">As at September 2026</span>' +
        '</div>' +
        '<h3 class="pd-name">' + ip(c.name) + '</h3>' +
        '<div><span class="pd-k">Mandate</span><p class="pd-mandate">' + ip(c.mandate) + '</p></div>' +
        '</div>' +
        '<div class="pd-body">' +
        '<div class="pd-facts">' +
        '<div><span class="pd-k">Entity / perimeter</span><p>' + ip(c.perimeter) + '</p></div>' +
        '<div><span class="pd-k">Availability</span><p>' + ip(c.avail) + '</p></div>' +
        '</div>' +
        '<div class="pd-engine">' +
        '<span class="pd-k" style="margin:0">Engine role</span>' +
        '<div class="pips" aria-hidden="true">' + ticks + '</div>' +
        '<span class="pd-role">' + ip(role(c)) + '</span>' +
        '</div>' +
        '</div>' +
        '<a class="pd-cta" href="#plt-engage">' + ip(c.cta) + ' <span class="pd-arr" aria-hidden="true">→</span></a>' +
        '</article>';
    },
    detail: function (c) {
      return '<div class="lv-x">' +
        '<div><span class="pd-k">Mandate</span><p class="pd-mandate">' + ip(c.mandate) + '</p><a class="plt-btn plt-btn--line plt-btn--sm" href="#plt-engage">' + ip(c.cta) + ' <span aria-hidden="true">→</span></a></div>' +
        '<dl><dt>Entity / perimeter</dt><dd>' + ip(c.perimeter) + '</dd><dt>Availability</dt><dd>' + ip(c.avail) + '</dd><dt>Engine role</dt><dd><b>' + ip(role(c)) + '</b></dd><dt>Registry</dt><dd>As at September 2026</dd></dl>' +
        '</div>';
    },
    row: function (c, i, S) {
      var open = S.open === c.name;
      return '<div class="lv-item' + (open ? ' lv-item--open' : '') + (isFocus(S, c) ? ' lv-item--focus' : '') + '" style="animation-delay:' + (i * 60) + 'ms" data-plt-cap="' + CAPS.indexOf(c) + '">' +
        '<button type="button" class="lv-row" aria-expanded="' + open + '" data-plt-row>' +
        '<span class="lv-name">' + glyph(MG[c.mat]) + '<span><b>' + ip(c.name) + '</b><small>' + ip(c.mat) + '</small></span></span>' +
        '<span><span class="' + tagCls(c) + '">' + glyph(RG[c.rel]) + ip(c.rel) + '</span></span>' +
        '<span class="lv-role">' + ip(role(c)) + '</span>' +
        '<span class="lv-chev" aria-hidden="true">→</span>' +
        '</button>' +
        (open ? VIEW.detail(c) : '') +
        '</div>';
    },
    results: function (S) {
      var list = listFor(S);
      if (!list.length) {
        return '<div class="dr-empty"><p style="margin:0">No platforms match this combination. Try a different maturity or relationship, or clear the filters.</p><button type="button" class="plt-btn plt-btn--line plt-btn--sm" data-plt-clear>Clear filters</button></div>';
      }
      if (S.view === 'list') {
        return '<div class="lv"><div class="lv-h" aria-hidden="true"><span>Platform</span><span>Relationship</span><span>Engine role</span><span></span></div>' +
          list.map(function (c, i) { return VIEW.row(c, i, S); }).join('') + '</div>';
      }
      return '<div class="dg">' + list.map(function (c, i) { return VIEW.card(c, i, S); }).join('') + '</div>';
    }
  };
  function activeFilters(S) {
    var out = [];
    if (S.mat !== 'All') out.push({ key: 'mat', value: S.mat });
    if (S.rel !== 'All') out.push({ key: 'rel', value: S.rel });
    return out;
  }
  var DEFAULT_STATE = { mat: 'All', rel: 'All', view: 'grid', open: null, jump: null };
  /* VIEW:end */

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function scrollBehavior() { return prefersReducedMotion() ? 'auto' : 'smooth'; }
  function setText(el, value) { if (el && el.textContent !== value) el.textContent = value; }
  function fragment(html) {
    var t = document.createElement('template');
    t.innerHTML = html;
    return t.content;
  }

  /* ---------------------------------------------------------------- */
  function init(root) {
    var ac = typeof AbortController === 'function' ? new AbortController() : null;
    var cleanups = [];
    var timers = {};
    var observers = [];
    function on(target, type, fn, opts) {
      var o = opts || {};
      if (ac) {
        o = Object.assign({}, o, { signal: ac.signal });
        target.addEventListener(type, fn, o);
      } else {
        target.addEventListener(type, fn, o);
        cleanups.push(function () { target.removeEventListener(type, fn, o); });
      }
    }
    function q(sel) { return root.querySelector(sel); }
    function qa(sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }

    root.classList.add('plt-js'); // enables the scroll-reveal start state (content stays visible without JS)

    /* ---------- config: image, links, toggles ---------- */
    var cfg = {};
    try {
      var cfgEl = document.getElementById(CONFIG_ID);
      if (cfgEl) cfg = JSON.parse(cfgEl.textContent || '{}') || {};
    } catch (err) { cfg = {}; }
    var links = cfg.links || {};
    qa('[data-plt-link]').forEach(function (a) {
      var v = links[a.getAttribute('data-plt-link')];
      if (typeof v === 'string' && v) a.setAttribute('href', v);
    });
    var heroImg = q('[data-plt-asset="platformsHeroImage"]');
    var heroUrl = cfg.platformsHeroImage;
    // the untouched placeholder is skipped so it never produces a 404 request
    if (heroImg && typeof heroUrl === 'string' && heroUrl && heroUrl.indexOf('REPLACE-WITH') === -1) heroImg.src = heroUrl;
    var hdrHostEl = q('[data-plt-hdr-host]');
    if (cfg.showHeader === false && hdrHostEl) hdrHostEl.parentNode.removeChild(hdrHostEl);
    var footerEl = q('[data-plt-footer]');
    if (cfg.showFooter === false && footerEl) footerEl.parentNode.removeChild(footerEl);
    var dirCfg = cfg.directory || {};
    var syncUrl = dirCfg.syncUrl !== false;

    /* ---------- in-page anchors: smooth scroll (source used html{scroll-behavior:smooth}) ---------- */
    on(root, 'click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a || !root.contains(a)) return;
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target || !root.contains(target)) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
      try { if (history.pushState) history.pushState(null, '', '#' + id); } catch (err) { /* sandboxed */ }
    });

    /* ================= SITE HEADER ================= */
    var header = null;
    var hdr = q('[data-plt-hdr]');
    if (hdr) {
      header = (function () {
        var util = q('[data-plt-hdr-util]');
        var dd = q('[data-plt-dd]');
        var ddToggle = q('[data-plt-dd-toggle]');
        var ddPanel = q('[data-plt-dd-panel]');
        var burger = q('[data-plt-menu-open]');
        var menuParts = qa('[data-plt-menu-part]');
        var utilH = 0, stuck = false, ddOpen = false, menuOpen = false, prevBodyOverflow = '';
        var acc = { hiw: true, gov: false };

        function setDd(open) {
          ddOpen = open;
          ddToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
          ddPanel.hidden = !open;
        }
        function setMenu(open) {
          if (open === menuOpen) return;
          menuOpen = open;
          // source behaviour: lock page scroll while the drawer is open; restored on close/teardown
          if (open) { prevBodyOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; }
          else { document.body.style.overflow = prevBodyOverflow; }
          burger.setAttribute('aria-expanded', open ? 'true' : 'false');
          menuParts.forEach(function (el) { el.hidden = !open; });
        }
        function setAcc(key, open) {
          acc[key] = open;
          var btn = q('[data-plt-acc="' + key + '"]');
          var panel = q('[data-plt-acc-panel="' + key + '"]');
          if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
          if (panel) panel.hidden = !open;
        }
        function onScroll() {
          // Source: stuck = window.scrollY > utilH + 2 (header at page top). Measured relative to the
          // widget so it stays correct when GHL content sits above it.
          var s = -root.getBoundingClientRect().top > utilH + 2;
          if (s !== stuck) { stuck = s; hdr.classList.toggle('plt-hdr--stuck', s); }
        }
        function measure() {
          utilH = util ? util.offsetHeight : 0;
          root.style.setProperty('--util-h', utilH + 'px');
          root.style.setProperty('--nav-h', hdr.offsetHeight + 'px');
          if (window.innerWidth >= OPTIONS.headerDesktopMin && menuOpen) setMenu(false);
          onScroll();
        }
        on(dd, 'mouseenter', function () {
          clearTimeout(timers.dd);
          if (window.matchMedia && window.matchMedia('(hover:hover)').matches) setDd(true);
        });
        on(dd, 'mouseleave', function () {
          clearTimeout(timers.dd);
          timers.dd = setTimeout(function () { setDd(false); }, 160);
        });
        on(ddToggle, 'click', function () { setDd(!ddOpen); });
        qa('[data-plt-dd-close]').forEach(function (el) { on(el, 'click', function () { setDd(false); }); });
        on(burger, 'click', function () { setMenu(true); });
        qa('[data-plt-menu-close]').forEach(function (el) { on(el, 'click', function () { setMenu(false); }); });
        qa('[data-plt-acc]').forEach(function (btn) {
          on(btn, 'click', function () { var k = btn.getAttribute('data-plt-acc'); setAcc(k, !acc[k]); });
        });
        on(document, 'mousedown', function (e) { if (ddOpen && !dd.contains(e.target)) setDd(false); });
        on(document, 'keydown', function (e) {
          if (e.key === 'Escape') { if (ddOpen) setDd(false); if (menuOpen) setMenu(false); }
        });
        measure();
        timers.hdrRaf = requestAnimationFrame(measure);
        return {
          onScroll: onScroll,
          measure: measure,
          destroy: function () { if (menuOpen) setMenu(false); clearTimeout(timers.dd); }
        };
      })();
    } else {
      root.style.setProperty('--util-h', '0px');
    }

    /* ================= SCROLL REVEAL (.rv → .rv-in once, 15% visible) ================= */
    var reveals = qa('.rv');
    if (typeof IntersectionObserver !== 'function') {
      reveals.forEach(function (el) { el.classList.add('rv-in'); });
    } else {
      var rvIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('rv-in'); rvIO.unobserve(en.target); }
        });
      }, { threshold: OPTIONS.revealThreshold });
      reveals.forEach(function (el) { rvIO.observe(el); });
      observers.push(rvIO);
    }

    /* ================= 02–04 · REGISTERS + PLATFORM DIRECTORY ================= */
    var dirSec = q('[data-plt-dir]');
    if (dirSec) {
      (function () {
        var tb = q('[data-plt-tb]');
        var res = q('[data-plt-res]');
        var results = q('[data-plt-results]');
        var registers = document.getElementById('plt-registers');
        var S = Object.assign({}, DEFAULT_STATE);
        var own = function (o, k) { return Object.prototype.hasOwnProperty.call(o, k); };

        /* URL state: ?maturity=…&relationship=… (source keys, e.g. "In Development", "Group Build") */
        function readUrl() {
          try {
            var p = new URLSearchParams(location.search);
            var m = p.get('maturity'), r = p.get('relationship');
            if (m && own(MG, m)) S.mat = m;      // unknown values are ignored (source would show an empty list)
            if (r && own(RG, r)) S.rel = r;
          } catch (err) { /* no URLSearchParams */ }
        }
        // Source intent: history.replaceState('?maturity=…&relationship=…') on every filter change. The
        // port only touches its own two parameters: other query parameters, the hash and history.state
        // of the host page are kept. Switch off with "directory": { "syncUrl": false }.
        function writeUrl() {
          if (!syncUrl) return;
          try {
            var kept = location.search.replace(/^\?/, '').split('&').filter(function (kv) {
              if (!kv) return false;
              var k = kv.split('=')[0];
              try { k = decodeURIComponent(k.replace(/\+/g, ' ')); } catch (err) { /* keep raw */ }
              return k !== 'maturity' && k !== 'relationship';
            });
            if (S.mat !== 'All') kept.push('maturity=' + encodeURIComponent(S.mat));
            if (S.rel !== 'All') kept.push('relationship=' + encodeURIComponent(S.rel));
            var search = kept.length ? '?' + kept.join('&') : '';
            if (search !== location.search) history.replaceState(history.state, '', location.pathname + search + location.hash);
          } catch (err) { /* sandboxed frame */ }
        }

        /* ---- in-place updates (the source re-renders these without re-mounting, so focus is kept) ---- */
        function renderControls() {
          var list = listFor(S);
          qa('[data-plt-mixbar] > i').forEach(function (bar, i) {
            bar.className = 'plt-' + MG[CAPS[i].mat] + (list.indexOf(CAPS[i]) < 0 ? ' plt-dim' : '');
          });
          qa('[data-plt-mix]').forEach(function (b) { b.setAttribute('aria-pressed', String(S.mat === b.getAttribute('data-plt-mix'))); });
          ['mat', 'rel'].forEach(function (key) {
            qa('[data-plt-' + key + ']').forEach(function (b) {
              var k = b.getAttribute('data-plt-' + key);
              var n = chipCount(key, k, S);
              b.classList.toggle('plt-chip--zero', n === 0);
              b.setAttribute('aria-pressed', String(S[key] === k));
              setText(b.querySelector('.plt-chip__n .plt-i'), String(n));
            });
          });
          // "Showing N of 6" + active filter chips (reused by position, as React does) + "Clear all"
          setText(res.querySelector('b .plt-i'), String(list.length));
          var want = activeFilters(S);
          var have = qa('[data-plt-res] [data-plt-af]');
          var clearBtn = res.querySelector('[data-plt-clear]');
          want.forEach(function (f, i) {
            var el = have[i];
            if (!el) {
              el = fragment(VIEW.af(f)).firstChild;
              res.insertBefore(el, clearBtn);
            } else {
              el.setAttribute('data-plt-af', f.key);
              el.setAttribute('aria-label', 'Remove ' + f.value + ' filter');
              setText(el.querySelector('.plt-i'), LBL[f.value]);
            }
          });
          have.slice(want.length).forEach(function (el) { el.parentNode.removeChild(el); });
          var filtered = want.length > 0;
          if (filtered && !clearBtn) res.appendChild(fragment('<button type="button" class="af af--clear" data-plt-clear>Clear all</button>').firstChild);
          if (!filtered && clearBtn) clearBtn.parentNode.removeChild(clearBtn);
          qa('[data-plt-view]').forEach(function (b) { b.setAttribute('aria-pressed', String(S.view === b.getAttribute('data-plt-view'))); });
        }
        // grid / list / empty state: re-mounted (the source re-keys the cards, which replays their entrance)
        function mountResults() {
          var first = results.firstElementChild;
          if (first && !first.classList.contains('dr-fn')) results.removeChild(first);
          results.insertBefore(fragment(VIEW.results(S)), results.firstElementChild);
        }
        function mountJump() {
          var old = q('[data-plt-jump]');
          if (old) old.parentNode.removeChild(old);
          if (S.jump) results.parentNode.insertBefore(fragment(VIEW.jump(S)), results);
        }
        // setF: every filter change clears the jump banner and re-mounts the results
        function setFilters(o) {
          var matRel = S.mat + '|' + S.rel;
          Object.assign(S, { jump: null }, o);
          renderControls();
          mountJump();
          mountResults();
          if (S.mat + '|' + S.rel !== matRel) writeUrl();
        }
        function goDir(c) {
          // the banner is re-mounted on every jump (source re-keys it), so its entrance replays
          setFilters({ mat: c.mat, rel: c.rel, jump: { name: c.name || (c.mat + ' platforms'), single: !!c.name, filter: c.rel === 'All' ? c.mat : c.mat + ' · ' + c.rel } });
          window.scrollTo({ top: tb.getBoundingClientRect().top + window.pageYOffset - OPTIONS.jumpOffset, behavior: scrollBehavior() });
        }
        function dropJump() {
          if (!S.jump) return;
          S.jump = null;
          mountJump();
          qa('.pd--focus').forEach(function (el) { el.classList.remove('pd--focus'); });
          qa('.lv-item--focus').forEach(function (el) { el.classList.remove('lv-item--focus'); });
        }
        // one row open at a time; rows are updated in place (no re-mount, so no entrance replay)
        function toggleRow(item) {
          var c = CAPS[Number(item.getAttribute('data-plt-cap'))];
          S.open = S.open === c.name ? null : c.name;
          qa('.lv-item').forEach(function (el) {
            var ec = CAPS[Number(el.getAttribute('data-plt-cap'))];
            var open = S.open === ec.name;
            el.className = 'lv-item' + (open ? ' lv-item--open' : '') + (isFocus(S, ec) ? ' lv-item--focus' : '');
            el.querySelector('[data-plt-row]').setAttribute('aria-expanded', String(open));
            var x = el.querySelector('.lv-x');
            if (x && !open) el.removeChild(x);
            if (!x && open) el.appendChild(fragment(VIEW.detail(ec)));
          });
        }

        on(root, 'click', function (e) {
          var t = e.target.closest ? e.target.closest('button') : null;
          if (!t || !root.contains(t)) return;
          var go = t.getAttribute('data-plt-go');
          if (go === 'cap') { goDir(CAPS[Number(t.getAttribute('data-plt-key'))]); return; }
          if (go === 'mat') { goDir({ mat: t.getAttribute('data-plt-key'), rel: 'All' }); return; }
          if (!dirSec.contains(t)) return;
          var k;
          if ((k = t.getAttribute('data-plt-mix')) !== null) { setFilters({ mat: S.mat === k ? 'All' : k }); return; }
          if ((k = t.getAttribute('data-plt-mat')) !== null) { if (S.mat !== k) setFilters({ mat: k }); return; }
          if ((k = t.getAttribute('data-plt-rel')) !== null) { if (S.rel !== k) setFilters({ rel: k }); return; }
          if ((k = t.getAttribute('data-plt-af')) !== null) { var o = {}; o[k] = 'All'; setFilters(o); return; }
          if (t.hasAttribute('data-plt-clear')) { setFilters({ mat: 'All', rel: 'All' }); return; }
          if ((k = t.getAttribute('data-plt-view')) !== null) {
            if (S.view !== k) { S.view = k; renderControls(); mountResults(); }
            return;
          }
          if ((k = t.getAttribute('data-plt-jb')) !== null) {
            if (k === 'clear') { setFilters({ mat: 'All', rel: 'All' }); return; }
            dropJump();
            if (k === 'back' && registers) {
              window.scrollTo({ top: registers.getBoundingClientRect().top + window.pageYOffset - OPTIONS.backOffset, behavior: scrollBehavior() });
            }
            return;
          }
          if (t.hasAttribute('data-plt-row')) toggleRow(t.parentNode);
        });

        readUrl();
        if (S.mat !== 'All' || S.rel !== 'All') { renderControls(); mountResults(); }
      })();
    }

    /* ================= shared scroll / resize ================= */
    var instance;
    function guardConnected() {
      if (root.isConnected) return true;
      // GoHighLevel re-rendered the widget: tear down and attach to the new root.
      instance.destroy();
      requestAnimationFrame(boot);
      return false;
    }
    function onScroll() {
      if (!guardConnected()) return;
      if (header) header.onScroll();
    }
    function onResize() {
      if (!guardConnected()) return;
      if (timers.resizeRaf) cancelAnimationFrame(timers.resizeRaf);
      timers.resizeRaf = requestAnimationFrame(function () {
        timers.resizeRaf = 0;
        if (header) header.measure();
      });
    }
    on(window, 'scroll', onScroll, { passive: true });
    on(window, 'resize', onResize, { passive: true });
    on(window, 'orientationchange', onResize, { passive: true });

    instance = {
      root: root,
      destroy: function () {
        if (instance.destroyed) return;
        instance.destroyed = true;
        if (header) header.destroy();
        if (ac) ac.abort();
        cleanups.forEach(function (fn) { fn(); });
        observers.forEach(function (o) { o.disconnect(); });
        clearTimeout(timers.dd);
        if (timers.resizeRaf) cancelAnimationFrame(timers.resizeRaf);
        if (timers.hdrRaf) cancelAnimationFrame(timers.hdrRaf);
        delete root.dataset.pltInit;
        if (window[INSTANCE_KEY] === instance) window[INSTANCE_KEY] = null;
      }
    };
    return instance;
  }

  /* ---------------- boot + duplicate-initialisation guard ---------------- */
  function boot() {
    var root = document.getElementById(ROOT_ID);
    if (!root) return false;
    var prev = window[INSTANCE_KEY];
    if (prev && !prev.destroyed) {
      if (prev.root === root && root.dataset.pltInit === 'true') return true;   // already running
      prev.destroy();                                                           // stale (re-rendered) instance
    }
    root.dataset.pltInit = 'true';
    window[INSTANCE_KEY] = init(root);
    return true;
  }

  if (!boot()) {
    var observer = null;
    var stopTimer = null;
    var tryBoot = function () {
      if (boot()) {
        if (observer) observer.disconnect();
        clearTimeout(stopTimer);
        document.removeEventListener('DOMContentLoaded', tryBoot);
      }
    };
    document.addEventListener('DOMContentLoaded', tryBoot);
    if (typeof MutationObserver === 'function') {
      observer = new MutationObserver(tryBoot);
      observer.observe(document.documentElement, { childList: true, subtree: true });
      stopTimer = setTimeout(function () { observer.disconnect(); }, 20000);
    }
  }
})();
