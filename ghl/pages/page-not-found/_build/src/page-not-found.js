/* BWCI — Page not found (404) · GoHighLevel runtime (vanilla JS, no dependencies).
   Replaces the Claude Design runtime (support.js, which only mounts the static markup and its <helmet> styles;
   the page has no text/x-dc logic and no React component). Everything is scoped to #bwci-page-not-found.
   The entrance, the cone's fade and float, and the hovers are CSS, as in the source; this script only applies the
   configuration: the logo and cone images and the two links. */
(function () {
  'use strict';

  /* Editable settings (logo and cone image URLs, the Home and Contact links) live in the
     <script type="application/json" id="bwci-page-not-found-config"> block at the very top of the Custom Code paste,
     not here. */

  var ROOT_ID = 'bwci-page-not-found';
  var CONFIG_ID = 'bwci-page-not-found-config';
  var INSTANCE_KEY = '__bwciPageNotFound';

/*@site-chrome*/

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

    /* ---------- config ---------- */
    var cfg = {};
    try {
      var cfgEl = document.getElementById(CONFIG_ID);
      if (cfgEl) cfg = JSON.parse(cfgEl.textContent || '{}') || {};
    } catch (err) { cfg = {}; }
    siteResolveImages(root,cfg);

    /* ---------- cone image (source: the bundled PNG): the configured URL, else no image ---------- */
    qa('img[data-nf-asset="notFoundConeImage"]').forEach(function (img) {
      var url = cfg.notFoundConeImage;
      var valid = siteImageAvailable(url);
      img.hidden = !valid;
      if (valid) { if (img.getAttribute('src') !== url) img.src = url; }
      else img.removeAttribute('src');
    });

    /* ---------- links: Home (logo and "Go home") and Contact ---------- */
    siteResolveLinks(cfg);
    var links = cfg.links || {};
    qa('a[data-nf-link]').forEach(function (a) {
      var v = links[a.getAttribute('data-nf-link')];
      siteLink(a, typeof v === 'string' && v ? v : a.getAttribute('href'));
    });

    /* ================= LOGO + UNAVAILABLE LINKS (shared site chrome; this page has no header or footer) ================= */
    var chrome = siteChrome(root, cfg, on, timers);

    /* ================= GoHighLevel re-render detection ================= */
    var instance = {
      root: root,
      destroy: function () {
        if (instance.destroyed) return;
        instance.destroyed = true;
        if (chrome) chrome.destroy();
        if (ac) ac.abort();
        cleanups.forEach(function (fn) { fn(); });
        delete root.dataset.nfInit;
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
    if (root) root.dataset.nfInit = 'true';
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
