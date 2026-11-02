/* BWCI — The Platform Today · GoHighLevel runtime (vanilla JS, no dependencies).
   Replaces the Claude Design runtime (support.js + React) used by design/Platform Today.dc.html and its
   SiteHeader / Breadcrumb / SiteFooter components and bwci-motion.js. Everything is scoped to #bwci-platform-today.
   The page's own text/x-dc component is reproduced below: the stages light up once they are 15 % visible, the
   paired cards highlight together on hover or focus, and the "How to read" button (shown while the stages are on
   screen) opens the guide dialog. */
(function () {
  'use strict';

  /* Editable settings (logo and hero image URLs, header/footer toggles, footer legal wording, page links) live in the
     <script type="application/json" id="bwci-platform-today-config"> block at the very top of the Custom Code
     paste, not here. */

  var ROOT_ID = 'bwci-platform-today';
  var CONFIG_ID = 'bwci-platform-today-config';
  var INSTANCE_KEY = '__bwciPlatformToday';

  /* ======================= BEHAVIOUR (source values) ======================= */
  var OPTIONS = {
    stagesThreshold: 0.15, // the stages light up (and the guide button shows) at 15 % visibility
    guideFocusDelay: 60    // ms before the open guide moves focus to its close button
  };

/*@site-chrome*/

  /* ---------------------------------------------------------------- */
  function init(root) {
    var ac = typeof AbortController === 'function' ? new AbortController() : null;
    var cleanups = [];
    var timers = {};
    function on(target, type, fn, opts) {
      if (!target) return;
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

    /* ---------- config: links ---------- */
    var cfg = {};
    try {
      var cfgEl = document.getElementById(CONFIG_ID);
      if (cfgEl) cfg = JSON.parse(cfgEl.textContent || '{}') || {};
    } catch (err) { cfg = {}; }
    siteResolveImages(root,cfg);

    /* ---------- hero image (source: ./assets/platform-today-hero-arcs.png): the configured URL, else no image ---------- */
    qa('img[data-ptd-asset="platformTodayHeroImage"]').forEach(function (img) {
      var url = cfg.platformTodayHeroImage;
      var valid = siteImageAvailable(url);
      img.hidden = !valid;
      if (valid) { if (img.getAttribute('src') !== url) img.src = url; }
      else img.removeAttribute('src');
    });

    siteResolveLinks(cfg);
    var links = cfg.links || {};
    qa('a[data-ptd-link]').forEach(function (a) {
      var v = links[a.getAttribute('data-ptd-link')];
      siteLink(a, typeof v === 'string' && v ? v : a.getAttribute('href'));
    });

    /* ================= THE PAGE (source text/x-dc component) ================= */
    var stages = q('[data-ptd-stages]');
    var stagesWrap = stages && stages.querySelector('.ptd-wrap');
    var fab = q('[data-ptd-guide-open]');
    var guide = q('[data-ptd-guide]');
    var guideX = q('[data-ptd-guide-x]');
    var cards = qa('[data-ptd-stages] article[data-ptd-pair]');
    // source state: { lg (guide open), pair (highlighted pair), st (stages lit), fab (stages on screen) }
    var state = { lg: false, pair: '', st: false, fab: false };
    var ret = null, prevOverflow = '';

    function renderStages() { if (stages) stages.classList.toggle('ptd-st-on', state.st); }
    function renderFab() { if (fab) fab.classList.toggle('ptd-gd-fab--on', state.fab && !state.lg); }
    function renderGuide() {
      if (!guide) return;
      guide.classList.toggle('ptd-gd--open', state.lg);
      guide.setAttribute('aria-hidden', state.lg ? 'false' : 'true');
      renderFab();
    }
    // source: each card's class is 'pc' + (pair ? (its pair === pair ? ' pc--hl' : ' pc--dim') : '')
    function setPair(pair) {
      state.pair = pair;
      cards.forEach(function (c) {
        var mine = c.getAttribute('data-ptd-pair');
        c.classList.toggle('ptd-pc--hl', !!pair && mine === pair);
        c.classList.toggle('ptd-pc--dim', !!pair && mine !== pair);
      });
    }
    // a copied live root starts from the source's initial state
    setPair('');
    renderStages();
    renderGuide();

    /* ---------- paired cards: hover or focus inside a card highlights its pair ---------- */
    cards.forEach(function (c) {
      var pair = c.getAttribute('data-ptd-pair');
      function enter() { if (pair && state.pair !== pair) setPair(pair); }
      function leave() { if (state.pair) setPair(''); }
      on(c, 'mouseenter', enter);
      on(c, 'mouseleave', leave);
      on(c, 'focusin', enter);
      on(c, 'focusout', leave);
    });

    /* ---------- stages: light up once, and show the guide button while they are on screen ---------- */
    var io = null;
    if (!stagesWrap || !('IntersectionObserver' in window)) { state.st = true; renderStages(); }
    else {
      io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { state.st = state.st || e.isIntersecting; state.fab = e.isIntersecting; });
        renderStages();
        renderFab();
      }, { threshold: OPTIONS.stagesThreshold });
      io.observe(stagesWrap);
    }

    /* ---------- guide dialog ---------- */
    // Like the source, opening it locks the page scroll on <html>; the host's own value is restored on close and
    // on teardown (the source cleared it to '').
    function lockScroll(lock) {
      var de = document.documentElement;
      if (lock) { prevOverflow = de.style.overflow; de.style.overflow = 'hidden'; }
      else de.style.overflow = prevOverflow;
    }
    function openGuide(e) {
      if (state.lg) return;
      ret = e && e.currentTarget;
      state.lg = true;
      renderGuide();
      lockScroll(true);
      clearTimeout(timers.focus);
      timers.focus = setTimeout(function () { if (guideX) guideX.focus(); }, OPTIONS.guideFocusDelay);
    }
    function closeGuide() {
      if (!state.lg) return;
      state.lg = false;
      renderGuide();
      lockScroll(false);
      clearTimeout(timers.focus);
      if (ret && ret.focus) ret.focus();
    }
    on(fab, 'click', openGuide);
    qa('[data-ptd-guide-close]').forEach(function (el) { on(el, 'click', closeGuide); });
    on(document, 'keydown', function (e) { if (e.key === 'Escape' && state.lg) closeGuide(); });

    /* ================= SITE HEADER + FOOTER (shared site chrome) ================= */
    var chrome = siteChrome(root, cfg, on, timers);

    /* ================= SHARED SCROLL MOTION (design/bwci-motion.js) =================
       bwci-motion skips sections with id "hero" or class hero / hero-fe; this hero (#ptd-top.pg-hero) has neither,
       so it is scanned like the other sections (its content starts on screen and stays untagged). */
    var motion = siteMotion(root, { heroId: null, heroSel: ':not(*)' }, on);

    /* ================= GoHighLevel re-render detection ================= */
    var instance = {
      root: root,
      destroy: function () {
        if (instance.destroyed) return;
        instance.destroyed = true;
        if (chrome) chrome.destroy();
        if (motion) motion.destroy();
        if (io) io.disconnect();
        clearTimeout(timers.focus);
        if (state.lg) { state.lg = false; lockScroll(false); }
        if (ac) ac.abort();
        cleanups.forEach(function (fn) { fn(); });
        delete root.dataset.ptdInit;
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
    if (root) root.dataset.ptdInit = 'true';
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
