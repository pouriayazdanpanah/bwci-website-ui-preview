/* BWCI — Investors & Partners · GoHighLevel runtime (vanilla JS, no dependencies).
   Replaces the Claude Design runtime (support.js + React) used by the Investors & Partners design page and
   its SiteHeader component. Everything is scoped to #bwci-investors-partners. */
(function () {
  'use strict';

  /* Editable settings (hero image URL, header/footer toggles, page links) live in the
     <script type="application/json" id="bwci-investors-partners-config"> block at the very top of the Custom
     Code paste, not here. */

  /* ======================= BEHAVIOUR (source values) ======================= */
  var OPTIONS = {
    headerDesktopMin: 1200,   // header switches to burger/drawer below this width
    revealThreshold: 0.15
  };

  var ROOT_ID = 'bwci-investors-partners';
  var CONFIG_ID = 'bwci-investors-partners-config';
  var INSTANCE_KEY = '__bwciInvestorsPartners';

  /* VIEW:start — page data and markup. _build/build.js also runs this part to write the default-state
     markup into the page, so the static HTML and the script always agree. */
  var PP = [
    ['Principle', 'Start with the need', 'Every structure begins with the underlying business activity and what it requires. We don\'t start with a predefined financial product.'],
    ['Principle', 'Use the right entity for the job', 'Different opportunities call for different operating, financial, and technical capabilities. Regulated activity is always carried out by the appropriate authorised entity.'],
    ['Objective', 'Build for productive use', 'The aim is to direct capital and capability towards businesses, projects, and platforms that create real economic value.']
  ];
  // [title, text, call to action, href, config link key (cross-page links only)]
  var PA = [
    ['Through delivery platforms', 'Alongside the financial and operating platforms in the ecosystem, as they become operational.', 'Explore platform pathways', '#inv-perimeters', null],
    ['Established businesses', 'Alongside established, productive businesses, where an appropriate structure and authorised vehicle exist.', 'Explore business pathways', '/smes-projects#sme-situation', 'smesSituation'],
    ['Infrastructure & transition projects', 'In long-term infrastructure and energy transition projects, through appropriately structured and authorised vehicles.', 'Explore project pathways', '/smes-projects#sme-situation', 'smesSituation'],
    ['Strategic capabilities', 'By contributing specialist capital, technology, infrastructure, or distribution that strengthens the network.', 'Explore strategic partnerships', '#inv-route', null]
  ];
  var ST = [
    ['Need', 'Need', 'What economic activity needs support, and why?'],
    ['Structure', 'Structure', 'What structure fits the activity and its cash flows?'],
    ['Delivery', 'Delivery', 'Which platform, entity, or partner is responsible for delivering it?'],
    ['Capital', 'Capital', 'What type of capital suits the structure and its risk profile?'],
    ['Productive use', 'Productive use', 'How does the capital reach the underlying activity, and how is that measured?']
  ];
  // node positions on the arc: one shared angle list drives the nodes and the focal line
  var ANGLES = [-60, -30, 0, 30, 60];
  var PM = [
    { t: 'Trade Finance Platform', kind: 'Trade & working capital', d: 'Designed to support trade flows and the working capital needs of productive businesses.', status: 'Group build · In development', st: 'dev' },
    { t: 'Private Capital Platform', kind: 'Private capital', d: 'Being designed to structure private debt and growth capital for established businesses.', status: 'Group build · In development', st: 'dev' },
    { t: 'Providence Asset Management Ltd', star: true, v: true, kind: 'Asset management', d: 'The Group’s asset management company. Any investment management is carried out by this entity, within its regulatory permissions.', status: 'Group company · Operating · Subject to verification', st: 'op' },
    { t: 'Partner Capabilities', kind: 'Partner capability', d: 'Specialist financial, technical, and operational capabilities provided by independent, authorised partner institutions.', status: 'Partner capability · Operating · Subject to verification', st: 'partner' }
  ];
  var EC = [
    ['Capital to the real economy', 'Connect suitable capital with genuine real-economy needs.'],
    ['Resilience through connection', 'Build stronger relationships between businesses, institutions, platforms, and capital providers.'],
    ['Scale without consolidation', 'Grow in a coordinated way without requiring every capability to sit inside one organisation.'],
    ['Governance & visibility', 'Keep a clear line of sight to real-economy outcomes across connected participants.']
  ];
  var RT = [
    ['Investors', 'You provide capital', 'You are an institutional investor, family office, development finance institution, or impact investor looking at platforms or real-economy activity that fits your mandate.', 'Discuss institutional participation'],
    ['Banks & financial institutions', 'You provide financial capabilities', 'You are a bank or regulated institution exploring co-financing, referrals, or other structured collaboration. The model is built to work with banks, not to replace them.', 'Discuss institutional collaboration'],
    ['Strategic partners', 'You provide specialist capability', 'You bring technology, infrastructure, distribution, advisory, or operational expertise.', 'Discuss a partnership'],
    ['Platform builders', 'You are building or connecting a platform', 'You are developing a platform, capital structure, or institution and want to explore connecting it to the ecosystem.', 'Start a conversation']
  ];

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;'; });
  }
  // {{…}} text in the source is wrapped by its runtime in span.sc-interp (mobile CSS sizes it); inv-i reproduces it
  function ip(s) { return '<span class="inv-i">' + esc(s) + '</span>'; }
  function pad(i) { return (i < 9 ? '0' : '') + (i + 1); }
  function nodePos(i) {
    var r = ANGLES[i] * Math.PI / 180;
    return { x: (50 + 50 * Math.cos(r)).toFixed(2), y: (50 + 50 * Math.sin(r)).toFixed(2) };
  }
  function railCls(S, i) { return S.mt === i ? 'inv-on' : (i < S.mt ? 'inv-done' : ''); }

  var VIEW = {
    props: function (S) {
      return PP.map(function (p, i) {
        // line breaks as in the source template (they separate the words of the accessible name)
        return '\n          <article class="pp-item' + (S.pp === i ? ' pp-item--on' : '') + '" tabindex="0" data-inv-pp="' + i + '">\n' +
          '<span class="pp-num">' + ip(pad(i)) + '</span>\n' +
          '<div>\n<p class="pp-lbl">' + ip(p[0]) + '</p>\n<h3 class="inv-h3">' + ip(p[1]) + '</h3>\n<p>' + ip(p[2]) + '</p>\n</div>\n' +
          '</article>';
      }).join('') + '\n      ';
    },
    paths: function () {
      return PA.map(function (p, i) {
        return '\n          <a class="pa-card" href="' + p[3] + '"' + (p[4] ? ' data-inv-link="' + p[4] + '"' : '') + ' data-n="' + pad(i) + '">' +
          '\n<h3 class="inv-h3">' + ip(p[0]) + '</h3>\n' +
          '<p>' + ip(p[1]) + '</p>\n' +
          '<span class="pa-cta"><span style="display:inline">' + ip(p[2]) + ' <span aria-hidden="true" style="display:inline-block">→</span></span></span>\n' +
          '</a>';
      }).join('') + '\n      ';
    },
    focal: function (S) { return '<span class="mt-focal" style="transform:rotate(' + ANGLES[S.mt] + 'deg)" data-inv-focal></span>'; },
    nodes: function (S) {
      return ST.map(function (s, i) {
        var p = nodePos(i);
        return '\n            <div class="mt-node' + (S.mt === i ? ' mt-node--on' : '') + '" style="left:' + p.x + '%; top:' + p.y + '%" data-inv-node="' + i + '">' +
          '<span class="mt-mk">' + ip(pad(i)) + '</span><span class="mt-lb">' + ip(s[0]) + '</span></div>';
      }).join('') + '\n          ';
    },
    fill: function (S) { return '<span class="mt-rail__fill" style="width:' + (S.mt * 25) + '%" data-inv-fill></span>'; },
    rail: function (S) {
      return ST.map(function (s, i) {
        return '\n            <button type="button" role="tab" class="' + railCls(S, i) + '" aria-selected="' + (S.mt === i) + '" aria-label="' + esc(s[0]) + '" data-inv-railstep="' + i + '">' +
          '<span class="mt-mk">' + ip(pad(i)) + '</span><span>' + ip(s[1]) + '</span></button>';
      }).join('') + '\n          ';
    },
    // re-mounted on every step change (source key = step), which replays its entrance
    stage: function (S) {
      var s = ST[S.mt];
      return '<div class="mt-anim" data-inv-stage>\n' +
        '<span class="mt-code">Stage ' + ip(pad(S.mt)) + ' of 05 · ' + ip(s[1]) + '</span>\n' +
        '<h3 class="mt-title">' + ip(s[0]) + '</h3>\n' +
        '<div class="mt-field">\n<span class="mt-lbl">The question</span>\n<p class="mt-q">' + ip(s[2]) + '</p>\n</div>\n' +
        '</div>';
    },
    prog: function (S) { return ST.map(function (s, i) { return '<i class="' + (i <= S.mt ? 'inv-on' : '') + '"></i>'; }).join(''); },
    perims: function () {
      return PM.map(function (p, i) {
        return '\n          <article class="dp-card' + (p.v ? ' dp-card--v' : '') + '">' +
          '<span class="dp-top"><span>Platform ' + ip(pad(i)) + '</span><span>' + ip(p.kind) + '</span></span>' +
          '<h3 class="dp-t">' + ip(p.t) + (p.star ? '<sup></sup>' : '') + '</h3>' +
          '<p class="dp-d">' + ip(p.d) + '</p>' +
          '<span class="inv-st inv-st--' + p.st + '"><span class="inv-st-g"></span>' + ip(p.status) + '</span>' +
          '</article>';
      }).join('') + '\n      ';
    },
    ecos: function () {
      return EC.map(function (e, i) {
        return '\n          <div class="ec-item">\n<span class="ec-n">' + ip(pad(i)) + '</span>\n<h3 class="ec-t">' + ip(e[0]) + '</h3>\n<p class="ec-d">' + ip(e[1]) + '</p>\n</div>';
      }).join('') + '\n      ';
    },
    routes: function (S) {
      return RT.map(function (r, i) {
        return '\n          <button type="button" role="tab" class="rt-tab' + (S.rt === i ? ' rt-tab--on' : '') + '" aria-selected="' + (S.rt === i) + '" data-inv-rt="' + i + '">\n' +
          '<span class="rt-tab__n"><span>Route ' + ip(pad(i)) + '</span><i aria-hidden="true">→</i></span>\n' +
          '<span class="rt-tab__t">' + ip(r[0]) + '</span>\n</button>';
      }).join('') + '\n      ';
    },
    // re-mounted on every route change (source key = route), which replays its entrance
    routePanel: function (S) {
      var r = RT[S.rt];
      return '<div class="rt-anim" data-inv-rt-panel>\n' +
        '<p class="rt-p__lbl">Route ' + ip(pad(S.rt)) + ' · ' + ip(r[0]) + '</p>\n' +
        '<h3 class="rt-p__role">' + ip(r[1]) + '</h3>\n' +
        '<p class="rt-p__d">' + ip(r[2]) + '</p>\n' +
        '</div>';
    },
    routeCta: function (S) { return RT[S.rt][3]; }
  };
  var DEFAULT_STATE = { pp: 0, mt: 0, rt: 0 };
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

    root.classList.add('inv-js'); // enables the scroll-reveal start state (content stays visible without JS)

    /* ---------- config: image, links, toggles ---------- */
    var cfg = {};
    try {
      var cfgEl = document.getElementById(CONFIG_ID);
      if (cfgEl) cfg = JSON.parse(cfgEl.textContent || '{}') || {};
    } catch (err) { cfg = {}; }
    var links = cfg.links || {};
    qa('[data-inv-link]').forEach(function (a) {
      var v = links[a.getAttribute('data-inv-link')];
      if (typeof v === 'string' && v) a.setAttribute('href', v);
    });
    var heroImg = q('[data-inv-asset="investorsHeroImage"]');
    var heroUrl = cfg.investorsHeroImage;
    // the untouched placeholder is skipped so it never produces a 404 request
    if (heroImg && typeof heroUrl === 'string' && heroUrl && heroUrl.indexOf('REPLACE-WITH') === -1) heroImg.src = heroUrl;
    var hdrHostEl = q('[data-inv-hdr-host]');
    if (cfg.showHeader === false && hdrHostEl) hdrHostEl.parentNode.removeChild(hdrHostEl);
    var footerEl = q('[data-inv-footer]');
    if (cfg.showFooter === false && footerEl) footerEl.parentNode.removeChild(footerEl);

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
      // as a native fragment jump does: focus moves to the (non-focusable) target, i.e. off the link
      if (document.activeElement && root.contains(document.activeElement) && target.tabIndex < 0) document.activeElement.blur();
      try { if (history.pushState) history.pushState(null, '', '#' + id); } catch (err) { /* sandboxed */ }
    });

    /* ================= SITE HEADER ================= */
    var header = null;
    var hdr = q('[data-inv-hdr]');
    if (hdr) {
      header = (function () {
        var util = q('[data-inv-hdr-util]');
        var dd = q('[data-inv-dd]');
        var ddToggle = q('[data-inv-dd-toggle]');
        var ddPanel = q('[data-inv-dd-panel]');
        var burger = q('[data-inv-menu-open]');
        var menuParts = qa('[data-inv-menu-part]');
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
          var btn = q('[data-inv-acc="' + key + '"]');
          var panel = q('[data-inv-acc-panel="' + key + '"]');
          if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
          if (panel) panel.hidden = !open;
        }
        function onScroll() {
          // Source: stuck = window.scrollY > utilH + 2 (header at page top). Measured relative to the
          // widget so it stays correct when GHL content sits above it.
          var s = -root.getBoundingClientRect().top > utilH + 2;
          if (s !== stuck) { stuck = s; hdr.classList.toggle('inv-hdr--stuck', s); }
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
        qa('[data-inv-dd-close]').forEach(function (el) { on(el, 'click', function () { setDd(false); }); });
        on(burger, 'click', function () { setMenu(true); });
        qa('[data-inv-menu-close]').forEach(function (el) { on(el, 'click', function () { setMenu(false); }); });
        qa('[data-inv-acc]').forEach(function (btn) {
          on(btn, 'click', function () { var k = btn.getAttribute('data-inv-acc'); setAcc(k, !acc[k]); });
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

    /* ================= 01 PROPOSITION · 03 METHODOLOGY · 06 ROUTE ================= */
    // Source state { pp, mt, rt }. Lists are updated in place, as React reconciled them; the methodology
    // stage and the route panel are re-mounted (source keys), which replays their entrance.
    var S = Object.assign({}, DEFAULT_STATE);
    var ppEls = qa('[data-inv-pp]');
    var nodeEls = qa('[data-inv-node]');
    var railEls = qa('[data-inv-railstep]');
    var progEls = qa('.mt-prog > i');
    var focalEl = q('[data-inv-focal]');
    var fillEl = q('[data-inv-fill]');
    var rtEls = qa('[data-inv-rt]');
    var rtCta = q('[data-inv-rt-cta]');

    function remount(sel, html) {
      var old = q(sel);
      if (old) old.parentNode.replaceChild(fragment(html), old);
    }
    function pickPp(i) {
      if (S.pp === i) return;
      S.pp = i;
      ppEls.forEach(function (el, j) { el.classList.toggle('pp-item--on', j === i); });
    }
    function setMt(i) {
      var n = (i + ST.length) % ST.length; // previous / next wrap around
      if (S.mt === n) return;
      S.mt = n;
      nodeEls.forEach(function (el, j) { el.classList.toggle('mt-node--on', j === n); });
      railEls.forEach(function (b, j) {
        var c = railCls(S, j);
        if (b.className !== c) b.className = c;
        b.setAttribute('aria-selected', String(j === n));
      });
      progEls.forEach(function (el, j) { el.className = j <= n ? 'inv-on' : ''; });
      if (focalEl) focalEl.style.transform = 'rotate(' + ANGLES[n] + 'deg)';
      if (fillEl) fillEl.style.width = (n * 25) + '%';
      remount('[data-inv-stage]', VIEW.stage(S));
    }
    function pickRt(i) {
      if (S.rt === i) return;
      S.rt = i;
      rtEls.forEach(function (b, j) {
        b.classList.toggle('rt-tab--on', j === i);
        b.setAttribute('aria-selected', String(j === i));
      });
      remount('[data-inv-rt-panel]', VIEW.routePanel(S));
      setText(rtCta, VIEW.routeCta(S));
    }

    ppEls.forEach(function (el, i) {
      var pick = function () { pickPp(i); };
      on(el, 'mouseenter', pick);
      on(el, 'focus', pick);
    });
    nodeEls.forEach(function (el, i) {
      var pick = function () { setMt(i); };
      on(el, 'click', pick);
      on(el, 'mouseenter', pick);
    });
    railEls.forEach(function (b, i) { on(b, 'click', function () { setMt(i); }); });
    var prevBtn = q('[data-inv-mt-prev]');
    var nextBtn = q('[data-inv-mt-next]');
    if (prevBtn) on(prevBtn, 'click', function () { setMt(S.mt - 1); });
    if (nextBtn) on(nextBtn, 'click', function () { setMt(S.mt + 1); });
    rtEls.forEach(function (b, i) {
      var pick = function () { pickRt(i); };
      on(b, 'click', pick);
      on(b, 'mouseenter', pick);
      on(b, 'focus', pick);
    });

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
        delete root.dataset.invInit;
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
      if (prev.root === root && root.dataset.invInit === 'true') return true;   // already running
      prev.destroy();                                                           // stale (re-rendered) instance
    }
    root.dataset.invInit = 'true';
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
