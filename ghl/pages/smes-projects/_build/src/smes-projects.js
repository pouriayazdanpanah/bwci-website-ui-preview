/* BWCI — SMEs & Projects · GoHighLevel runtime (vanilla JS, no dependencies).
   Replaces the Claude Design runtime (support.js + React) used by the SMEs & Projects design page and its
   SiteHeader component. Everything is scoped to #bwci-smes-projects. */
(function () {
  'use strict';

  /* Editable settings (hero image URL, header/footer toggles, page links) live in the
     <script type="application/json" id="bwci-smes-projects-config"> block at the very top of the Custom
     Code paste, not here. */

  /* ======================= BEHAVIOUR (source values) ======================= */
  var OPTIONS = {
    revealThreshold: 0.15
  };

  var ROOT_ID = 'bwci-smes-projects';
  var CONFIG_ID = 'bwci-smes-projects-config';
  var INSTANCE_KEY = '__bwciSmesProjects';

  /* VIEW:start — page data and markup. _build/build.js also runs this part to write the default-state
     markup into the page, so the static HTML and the script always agree. */
  var CAPS = [
    { name: 'Trade Finance Platform', status: 'Group build · In development', st: 'dev', mandate: 'Being designed to support trade and supply-chain finance, including invoice-based and stock-based working capital.', rel: 'Intended for businesses with cash tied up in trade cycles. Not yet available.', fit: 'Relevant to need 01 · Working capital & trade' },
    { name: 'Private Capital Platform', status: 'Group build · In development', st: 'dev', mandate: 'Being designed to provide growth capital, asset finance, and flexible debt structures.', rel: 'Intended for established businesses seeking growth capital that doesn\'t require selling equity. Not yet available.', fit: 'Relevant to needs 02 & 03 · Growth and productive assets' },
    { name: 'Providence Asset Management Ltd*', status: 'Group company · Operating · Subject to verification', st: 'op', mandate: 'An asset management company focused on private-market strategies, which may include private credit and infrastructure.', rel: 'The funds it manages may invest in larger infrastructure and transition projects, subject to their own mandates and approval processes.', fit: 'Relevant to need 04 · Infrastructure & energy transition projects' },
    { name: 'Partner Capabilities', status: 'Partner capability · Operating · Subject to verification', st: 'partner', mandate: 'Specialist services delivered by independent, authorised partner institutions.', rel: 'Where relevant, we may introduce you to a partner. Each partner operates under its own authorisation and terms.', fit: 'May support any of the needs above' }
  ];
  var SITS = [
    { cat: 'Business need', sub: 'Cash flow & timing', title: 'Working capital & trade', copy: 'Cash tied up in supply chains, unpaid invoices, stock, or long customer payment terms.', link: 'How trade finance may help', cap: 0 },
    { cat: 'Business need', sub: 'Growth', title: 'Growth & expansion', copy: 'Adding capacity, entering new markets, or delivering a large new contract.', link: 'How private capital may help', cap: 1 },
    { cat: 'Business need', sub: 'Assets', title: 'Equipment & productive assets', copy: 'Machinery, equipment, or plant, with repayment designed around the asset\'s working life.', link: 'How asset finance may help', cap: 1 },
    { cat: 'Project need', sub: 'Long-term', title: 'Infrastructure & energy transition projects', copy: 'Long-term capital for energy, infrastructure, and regional development projects.', link: 'How project capital may help', cap: 2 }
  ];
  var PR = [
    { title: 'Your need', sub: 'Understand what the business actually needs.', heading: 'Understand what the business actually needs.', body: 'We look at your cash flows, contracts, and the real constraints holding you back before suggesting anything.', proof: 'We start from your situation, not from a product list.' },
    { title: 'The structure', sub: 'Design a structure that fits your cash flows.', heading: 'Design a structure that fits your cash flows.', body: 'Terms, timing, and repayment are considered against how your business actually earns money.', proof: 'Repayment is designed around the life of the asset or contract.' },
    { title: 'The right provider', sub: 'Identify who could deliver it.', heading: 'Identify who could deliver it.', body: 'Your need is considered against the group\'s platforms and independent partner institutions. Any regulated activity is carried out by the authorised entity responsible for it.', proof: 'You\'ll always know which organisation you are dealing with.' },
    { title: 'The capital', sub: 'Identify suitable sources of capital.', heading: 'Identify suitable sources of capital.', body: 'Where a suitable route exists, we explore which capital providers may be aligned with the structure and the activity it supports.', proof: 'Any capital is subject to the provider\'s own assessment and approval.' },
    { title: 'Your business', sub: 'Capital put to work in your business.', heading: 'Capital put to work in your business.', body: 'If a route is agreed, it is delivered by the appropriate entity, and the capital goes into your operations.', proof: 'You keep ownership and control of your business.' }
  ];
  var PC = [
    ['Start with the need', 'We understand your cash flows and the actual problem before any structure is considered.'],
    ['Fit the structure to the cash flows', 'Timing, terms, and repayment are considered against your operating cycle and the life of your assets.'],
    ['The right entity for the job', 'Any regulated activity is carried out by the authorised entity or partner responsible for it, and we\'ll tell you which one.'],
    ['Your business stays yours', 'Taking part in the ecosystem doesn\'t require giving up equity or board control.'],
    ['Focused on productive activity', 'The aim is to provide capital that keeps real businesses operating and growing.']
  ];

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;'; });
  }
  // {{…}} text in the source is wrapped by its runtime in span.sc-interp (mobile CSS sizes it); sme-i reproduces it
  function ip(s) { return '<span class="sme-i">' + esc(s) + '</span>'; }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function prLabel(step) { return 'Step ' + pad2(step) + ' · ' + PR[step - 1].title; }

  var VIEW = {
    sits: function (S) {
      return SITS.map(function (s, i) {
        var on = S.sit === i;
        return '\n          <article class="sit-card' + (on ? ' sit-card--on' : '') + '" aria-pressed="' + on + '" tabindex="0" data-sme-sit="' + i + '">' +
          '<div class="sit-card__top">' +
          '<span class="sit-card__num">' + ip(pad2(i + 1)) + '</span>' +
          '<span class="sit-card__cat"><b>' + ip(s.cat) + '</b><span>' + ip(s.sub) + '</span></span>' +
          '<span class="sit-card__radio" aria-hidden="true"></span>' +
          '</div>' +
          '<h3 class="sme-h3">' + ip(s.title) + '</h3>' +
          '<p class="sit-card__copy">' + ip(s.copy) + '</p>' +
          '<div class="sit-card__foot">' +
          '<span class="sit-card__match"><i>Matched perimeter</i><b>' + ip(CAPS[s.cap].name.replace('*', '')) + '</b></span>' +
          '<a class="sit-card__link" href="#sme-perimeters">' + ip(s.link) + ' <span class="sit-card__arrow" aria-hidden="true">→</span></a>' +
          '</div>' +
          '</article>';
      }).join('') + '\n      ';
    },
    chapters: function (S) {
      return PR.map(function (c, i) {
        return '\n          <button class="pr-chapter" type="button" data-step="' + (i + 1) + '" aria-pressed="' + (S.pr === i + 1) + '" data-sme-step="' + (i + 1) + '">' +
          '<span class="pr-chapter-num">' + ip(pad2(i + 1)) + '</span>' +
          '<span class="pr-chapter-title">' + ip(c.title) + '</span>' +
          '<span class="pr-chapter-sub">' + ip(c.sub) + '</span>' +
          '</button>';
      }).join('') + '\n        ';
    },
    caps: function (S) {
      return CAPS.map(function (c, i) {
        return '\n          <button class="pm-card' + (S.cap === i ? ' pm-card--on' : '') + '" type="button" aria-pressed="' + (S.cap === i) + '" data-sme-cap="' + i + '">' +
          '<span class="pm-card__idx">' + ip('0' + (i + 1)) + '</span>' +
          '<span class="pm-card__t">' + ip(c.name) + '</span>' +
          '<span class="sme-st sme-st--' + c.st + '"><span class="sme-st-g"></span>' + ip(c.status) + '</span>' +
          '<span class="pm-card__go" aria-hidden="true">→</span>' +
          '</button>';
      }).join('') + '\n        ';
    },
    detail: function (S) {
      var c = CAPS[S.cap];
      // line breaks as in the source template: this is a live region, they keep the announced text readable
      return '<div class="pm-detail" aria-live="polite" data-sme-detail>\n' +
        '<p class="pm-detail__l">Matched capability</p>\n' +
        '<p class="pm-detail__name">' + ip(c.name) + '</p>\n' +
        '<span class="pm-detail__fit">' + ip(c.fit) + '</span>\n' +
        '<div class="pm-detail__grid">\n' +
        '<div>\n<p class="pm-detail__l">Mandate</p>\n<p class="pm-detail__t">' + ip(c.mandate) + '</p>\n</div>\n' +
        '<div>\n<p class="pm-detail__l">Relevance</p>\n<p class="pm-detail__t">' + ip(c.rel) + '</p>\n</div>\n' +
        '</div>\n' +
        '<div class="pm-detail__cta"><a href="#sme-engage">Discuss this need</a></div>\n' +
        '</div>';
    },
    pcs: function (S) {
      return PC.map(function (p, i) {
        var on = S.pc === i;
        return '\n          <button class="pc-row' + (on ? ' pc-row--on' : '') + '" type="button" aria-expanded="' + on + '" data-sme-pc="' + i + '">' +
          '<span class="pc-row__n">' + ip(pad2(i + 1)) + '</span>' +
          '<span><span class="pc-row__t" style="display:block">' + ip(p[0]) + '</span><span class="pc-row__d"><p>' + ip(p[1]) + '</p></span></span>' +
          '<span class="pc-row__i" aria-hidden="true">+</span>' +
          '</button>';
      }).join('') + '\n      ';
    },
    // the reading panel's four texts (written into the existing spans)
    reading: function (S) {
      var c = PR[S.pr - 1];
      return { prLabel: prLabel(S.pr), prHeading: c.heading, prBody: c.body, prProof: c.proof };
    }
  };
  var DEFAULT_STATE = { sit: 0, cap: 0, pr: 1, pc: 0 };
  /* VIEW:end */

/*@site-chrome*/

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

    root.classList.add('sme-js'); // enables the scroll-reveal start state (content stays visible without JS)

    /* ---------- config: image, links, toggles ---------- */
    var cfg = {};
    try {
      var cfgEl = document.getElementById(CONFIG_ID);
      if (cfgEl) cfg = JSON.parse(cfgEl.textContent || '{}') || {};
    } catch (err) { cfg = {}; }
    siteResolveImages(root,cfg);
    siteResolveLinks(cfg);
    var links = cfg.links || {};
    qa('[data-sme-link]').forEach(function (a) {
      var v = links[a.getAttribute('data-sme-link')];
      siteLink(a, typeof v === 'string' && v ? v : a.getAttribute('href'));
    });
    var heroImg = q('[data-sme-asset="smesHeroImage"]');
    var heroUrl = cfg.smesHeroImage;
    // the untouched placeholder is skipped so it never produces a 404 request
    if (heroImg && typeof heroUrl === 'string' && heroUrl && heroUrl.indexOf('REPLACE-WITH') === -1) heroImg.src = heroUrl;

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

    /* ================= SITE HEADER + FOOTER (shared site chrome) ================= */
    var chrome = siteChrome(root, cfg, on, timers);

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

    /* ================= SHARED SCROLL MOTION (design/bwci-motion.js) ================= */
    var motion = siteMotion(root, { heroId: 'sme-hero', heroSel: '.sme-hero' }, on);

    /* ================= 01–04 · SITUATION, PROCESS, PERIMETERS, PRINCIPLES ================= */
    // Source state { sit, cap, prActive, pc }. Everything is updated in place, as React reconciled it;
    // only the capability detail is re-mounted (source key = capability), which replays its entrance.
    var S = Object.assign({}, DEFAULT_STATE);
    var prSec = q('[data-sme-pr]');
    var sitEls = qa('[data-sme-sit]');
    var stepEls = qa('[data-sme-step]');
    var capEls = qa('[data-sme-cap]');
    var pcEls = qa('[data-sme-pc]');
    var readingEls = { prLabel: q('[data-sme-pr-label]'), prHeading: q('[data-sme-pr-heading]'), prBody: q('[data-sme-pr-body]'), prProof: q('[data-sme-pr-proof]') };

    function setCap(i) {
      if (S.cap === i) return;
      S.cap = i;
      capEls.forEach(function (b, j) {
        b.classList.toggle('pm-card--on', j === i);
        b.setAttribute('aria-pressed', String(j === i));
      });
      var old = q('[data-sme-detail]');
      if (old) old.parentNode.replaceChild(fragment(VIEW.detail(S)), old);
    }
    // choosing a situation also selects its matched capability
    function pickSit(i) {
      if (S.sit === i) return;
      S.sit = i;
      sitEls.forEach(function (el, j) {
        el.classList.toggle('sit-card--on', j === i);
        el.setAttribute('aria-pressed', String(j === i));
      });
      setCap(SITS[i].cap);
    }
    function pickStep(n) {
      if (S.pr === n) return;
      S.pr = n;
      if (prSec) prSec.setAttribute('data-active', String(n));
      stepEls.forEach(function (b, j) { b.setAttribute('aria-pressed', String(j + 1 === n)); });
      var texts = VIEW.reading(S);
      Object.keys(readingEls).forEach(function (k) { setText(readingEls[k], texts[k]); });
    }
    function pickPc(i) {
      if (S.pc === i) return;
      S.pc = i;
      pcEls.forEach(function (b, j) {
        b.classList.toggle('pc-row--on', j === i);
        b.setAttribute('aria-expanded', String(j === i));
      });
    }

    sitEls.forEach(function (el, i) {
      // the whole card is the control (its link to 03 bubbles here too); Enter/Space on the card or on
      // its link selects it and, as in the source, does not follow the link
      on(el, 'click', function () { pickSit(i); });
      on(el, 'keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickSit(i); }
      });
    });
    stepEls.forEach(function (b) {
      var n = Number(b.getAttribute('data-sme-step'));
      var pick = function () { pickStep(n); };
      on(b, 'mouseenter', pick);
      on(b, 'focus', pick);
      on(b, 'click', pick);
    });
    capEls.forEach(function (b, i) { on(b, 'click', function () { setCap(i); }); });
    pcEls.forEach(function (b, i) {
      var pick = function () { pickPc(i); };
      on(b, 'click', pick);
      on(b, 'mouseenter', pick);
      on(b, 'focus', pick);
    });

    /* ================= shared scroll / resize ================= */
    var instance;
    function guardConnected() { return root.isConnected; }

    instance = {
      root: root,
      destroy: function () {
        if (instance.destroyed) return;
        instance.destroyed = true;
        if (chrome) chrome.destroy();
        if (motion) motion.destroy();
        if (ac) ac.abort();
        cleanups.forEach(function (fn) { fn(); });
        observers.forEach(function (o) { o.disconnect(); });
        delete root.dataset.smeInit;
        if (window[INSTANCE_KEY] === instance) window[INSTANCE_KEY] = null;
      }
    };
    return instance;
  }

  // One owner per block: repeated execution reuses it; replacements tear down immediately, including
  // when GHL removes an ancestor without a scroll/resize event. No polling or continuous frames.
  var previous = window[INSTANCE_KEY];
  if (previous && !previous.destroyed && typeof previous.boot === 'function') { previous.boot(); return; }
  if (previous && typeof previous.destroy === 'function') previous.destroy();
  var pending = window[INSTANCE_KEY + 'Pending'];
  if (pending && typeof pending.destroy === 'function') pending.destroy();
  var app = { root: null, instance: null, observer: null, frame: null, destroyed: false };
  function boot() {
    if (app.destroyed) return;
    var root = document.getElementById(ROOT_ID);
    if (root === app.root && app.instance) return;
    if (app.instance) app.instance.destroy();
    app.root = root;
    if (root) root.dataset.smeInit = 'true';
    app.instance = root ? init(root) : null;
  }
  app.boot = boot;
  app.destroy = function () {
    if (app.destroyed) return;
    app.destroyed = true;
    if (app.observer) app.observer.disconnect();
    cancelAnimationFrame(app.frame);
    if (app.instance) app.instance.destroy();
    window.removeEventListener('pagehide', pagehide);
    document.removeEventListener('DOMContentLoaded', boot);
    app.root = null;
    app.instance = null;
    if (window[INSTANCE_KEY] === app) delete window[INSTANCE_KEY];
  };
  function pagehide(e) { if (!e.persisted) app.destroy(); }
  window[INSTANCE_KEY] = app;
  boot();
  app.observer = new MutationObserver(function () {
    if (app.root && app.root.isConnected) return;
    if (app.frame !== null) return;
    app.frame = requestAnimationFrame(function () { app.frame = null; boot(); });
  });
  app.observer.observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  window.addEventListener('pagehide', pagehide);
})();
