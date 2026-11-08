/* BWCI — Terms of use · GoHighLevel runtime (vanilla JS, no dependencies).
   Replaces the Claude Design runtime (support.js + React) used by design/Terms.dc.html and its SiteHeader /
   SiteFooter components and bwci-motion.js. Everything is scoped to #bwci-legal-terms. The page's own text/x-dc component
   (shared by the five legal pages) is reproduced below: the "Wording to approve" badge (source prop "flags") and the "On this page"
   index that marks the section being read. The legal pages bar (design/LegalNav.dc.html) comes from the shared site
   chrome. */
(function () {
  'use strict';

  /* Editable settings (logo URL, header/footer toggles, the "showFlags" source prop, footer legal wording, page links)
     live in the <script type="application/json" id="bwci-legal-terms-config"> block at the very top of the Custom Code
     paste, not here. */

  var ROOT_ID = 'bwci-legal-terms';
  var CONFIG_ID = 'bwci-legal-terms-config';
  var INSTANCE_KEY = '__bwciLegalTerms';

  /* ======================= BEHAVIOUR (source values) ======================= */
  var OPTIONS = {
    indexMargin: '-25% 0px -65% 0px' // the index marks a section once it crosses the band 25–35 % down the viewport
  };

/*@site-chrome*/

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function scrollBehavior() { return prefersReducedMotion() ? 'auto' : 'smooth'; }

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

    /* ---------- config: props, links ---------- */
    var cfg = {};
    try {
      var cfgEl = document.getElementById(CONFIG_ID);
      if (cfgEl) cfg = JSON.parse(cfgEl.textContent || '{}') || {};
    } catch (err) { cfg = {}; }
    siteResolveImages(root,cfg);

    /* source prop flags (default true): the "Wording to approve" badge. A non-boolean value keeps the default. */
    function flag(key, def) { return typeof cfg[key] === 'boolean' ? cfg[key] : def; }
    qa('[data-ltm-flag]').forEach(function (el) { el.hidden = !flag('showFlags', true); });

    siteResolveLinks(cfg);
    var links = cfg.links || {};
    qa('a[data-ltm-link]').forEach(function (a) {
      var v = links[a.getAttribute('data-ltm-link')];
      siteLink(a, typeof v === 'string' && v ? v : a.getAttribute('href'));
    });

    /* ---------- "On this page" links: smooth scroll (source used html{scroll-behavior:smooth}) ---------- */
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

    /* ---------- "On this page" index: marks the section crossing the reading band ---------- */
    var doc = q('[data-ltm-doc]');
    var index = q('[data-ltm-index]');
    var io = null;
    var indexLinks = index ? qa('[data-ltm-index] a') : [];
    // a copied live root starts from the source's initial state
    indexLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
    if (doc && index && 'IntersectionObserver' in window) {
      var mark = function (id) {
        indexLinks.forEach(function (a) { if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
      };
      io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) mark(e.target.id); }); }, { rootMargin: OPTIONS.indexMargin });
      Array.prototype.forEach.call(doc.querySelectorAll('section[id]'), function (s) { io.observe(s); });
      var first = doc.querySelector('section[id]');
      if (first) mark(first.id);
    }

    /* ================= SITE HEADER + FOOTER, LEGAL PAGES BAR (shared site chrome) ================= */
    var chrome = siteChrome(root, cfg, on, timers);
    // design/LegalNav.dc.html: the link list, or below 768 px a select that opens the chosen page
    var legalnav = siteGovNav(root, cfg, on);

    /* ================= SHARED SCROLL MOTION (design/bwci-motion.js) =================
       bwci-motion skips sections with id "hero" or class hero / hero-fe; this hero (#ltm-top.pg-hero) has neither,
       so it is scanned like the other sections (its content starts on screen and stays untagged). */
    var motion = siteMotion(root, { heroId: null, heroSel: ':not(*)' }, on);

    /* ================= GoHighLevel re-render detection ================= */
    var instance = {
      root: root,
      destroy: function () {
        if (instance.destroyed) return;
        instance.destroyed = true;
        if (chrome) chrome.destroy();
        if (legalnav) legalnav.destroy();
        if (motion) motion.destroy();
        if (io) io.disconnect();
        if (ac) ac.abort();
        cleanups.forEach(function (fn) { fn(); });
        delete root.dataset.ltmInit;
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
    if (root) root.dataset.ltmInit = 'true';
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
