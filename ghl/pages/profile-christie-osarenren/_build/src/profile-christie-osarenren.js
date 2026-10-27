/* BWCI - Governance profile: Christie Osarenren - standalone native runtime.
   Replaces the Claude Design runtime (support.js + React) used by the profile design page and its SiteHeader /
   Breadcrumb / GovNav / PersonCard / SiteFooter components, bwci-people.js, image-slot.js and bwci-motion.js.
   Everything is scoped to #bwci-profile-christie-osarenren. The page's own text/x-dc script only reveals .sr elements,
   which this page does not have, so it has no equivalent here. */
(function () {
  'use strict';

  /* Editable settings (logo and portrait image URLs, header/footer toggles, footer legal wording, page links)
     live in the <script type="application/json" id="bwci-profile-christie-osarenren-config"> block at the very top of the Custom
     Code paste, not here. */

  var ROOT_ID = 'bwci-profile-christie-osarenren';
  var CONFIG_ID = 'bwci-profile-christie-osarenren-config';
  var INSTANCE_KEY = '__bwciProfileChristieOsarenren';

/*@site-chrome*/

/*@profile*/

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
      var o = opts || {};
      if (ac) {
        o = Object.assign({}, o, { signal: ac.signal });
        target.addEventListener(type, fn, o);
      } else {
        target.addEventListener(type, fn, o);
        cleanups.push(function () { target.removeEventListener(type, fn, o); });
      }
    }
    function qa(sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }

    /* ---------- config: links ---------- */
    var cfg = {};
    try {
      var cfgEl = document.getElementById(CONFIG_ID);
      if (cfgEl) cfg = JSON.parse(cfgEl.textContent || '{}') || {};
    } catch (err) { cfg = {}; }
    var profile = siteProfile(root, on);
    siteResolveImages(root,cfg);
    siteResolveLinks(cfg);
    var links = cfg.links || {};
    qa('a[data-pco-link]').forEach(function (a) {
      var v = links[a.getAttribute('data-pco-link')];
      siteLink(a, typeof v === 'string' && v ? v : a.getAttribute('href'));
    });

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

    /* ================= SITE HEADER + FOOTER, GOVERNANCE SECTION BAR (shared site chrome) ================= */
    var chrome = siteChrome(root, cfg, on, timers);
    var govnav = siteGovNav(root, cfg, on);
    var people = sitePeople(root, cfg, on);

    /* ================= SHARED SCROLL MOTION (design/bwci-motion.js) =================
       bwci-motion skips sections with id "hero" or class hero / hero-fe; this hero (#top.pg-hero) has
       neither, so it is scanned like the other sections (its content starts on screen and stays untagged). */
    var motion = siteMotion(root, { heroId: null, heroSel: ':not(*)' }, on);

    /* ================= GoHighLevel re-render detection ================= */
    var instance;
    function guardConnected() { return root.isConnected; }

    instance = {
      root: root,
      destroy: function () {
        if (instance.destroyed) return;
        instance.destroyed = true;
        if (profile) profile.destroy();
        if (chrome) chrome.destroy();
        if (govnav) govnav.destroy();
        if (people) people.destroy();
        if (motion) motion.destroy();
        if (ac) ac.abort();
        cleanups.forEach(function (fn) { fn(); });
        delete root.dataset.pcoInit;
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
    if (root) root.dataset.pcoInit = 'true';
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
