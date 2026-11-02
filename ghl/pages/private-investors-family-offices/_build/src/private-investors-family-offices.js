/* BWCI — Private Investors & Family Offices · GoHighLevel runtime (vanilla JS, no dependencies).
   Replaces the Claude Design runtime (support.js + React) used by design/Private Investors Family Offices.dc.html
   and its SiteHeader / Breadcrumb / SiteFooter components and bwci-motion.js. Everything is scoped to
   #bwci-private-investors-family-offices. The page's own text/x-dc component is reproduced below: its two props
   (the review badges and the Providence Asset Management card) and the conversation track that lights up once it is
   40 % visible. */
(function () {
  'use strict';

  /* Editable settings (logo and page image URLs, header/footer toggles, the "showFlags" and "showPamCard" source
     props, footer legal wording, page links) live in the
     <script type="application/json" id="bwci-private-investors-family-offices-config"> block at the very top of the
     Custom Code paste, not here. */

  var ROOT_ID = 'bwci-private-investors-family-offices';
  var CONFIG_ID = 'bwci-private-investors-family-offices-config';
  var INSTANCE_KEY = '__bwciPrivateInvestorsFamilyOffices';

  /* ======================= BEHAVIOUR (source values) ======================= */
  var OPTIONS = {
    trackThreshold: 0.4 // the conversation track lights up once 40 % of it is visible
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
    function qa(sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }

    /* ---------- config: images, props, links ---------- */
    var cfg = {};
    try {
      var cfgEl = document.getElementById(CONFIG_ID);
      if (cfgEl) cfg = JSON.parse(cfgEl.textContent || '{}') || {};
    } catch (err) { cfg = {}; }
    siteResolveImages(root,cfg);

    /* page images (source: ./assets/pf-hero-threads.png and ./assets/pf-impact-scale.png): the configured URL, else
       no image */
    ['privateInvestorsHeroImage', 'privateInvestorsImpactImage'].forEach(function (key) {
      qa('img[data-pfo-asset="' + key + '"]').forEach(function (img) {
        var url = cfg[key];
        var valid = siteImageAvailable(url);
        img.hidden = !valid;
        if (valid) { if (img.getAttribute('src') !== url) img.src = url; }
        else img.removeAttribute('src');
      });
    });

    /* source prop showPamCard (default true): the Providence Asset Management card. A non-boolean value keeps the
       default. Hidden, it leaves the grid as the source's sc-if does (the other cards' layout does not depend on it). */
    qa('[data-pfo-pam]').forEach(function (el) { el.hidden = cfg.showPamCard === false; });

    /* ---------- review badges (source prop showFlags, default false) ----------
       As in the source (sc-if), a badge exists in the DOM only while shown. Each badge's classes and text sit in
       data-pfo-flag="classes|text" on its parent; it is appended last, as in the source. A copied live root drops
       the badges it carries and follows its own config. */
    var FLAG_CLASSES = ['pfo-tc', 'pfo-tc--inv'];
    qa('[data-pfo-flag-on]').forEach(function (el) { el.remove(); });
    if (cfg.showFlags === true) qa('[data-pfo-flag]').forEach(function (host) {
      var spec = host.getAttribute('data-pfo-flag').split('|');
      var badge = document.createElement('span');
      badge.className = spec[0].split(' ').filter(function (c) { return FLAG_CLASSES.indexOf(c) >= 0; }).join(' ');
      badge.textContent = spec[1] || '';
      badge.setAttribute('data-pfo-flag-on', '');
      host.appendChild(badge);
    });

    siteResolveLinks(cfg);
    var links = cfg.links || {};
    qa('a[data-pfo-link]').forEach(function (a) {
      var v = links[a.getAttribute('data-pfo-link')];
      siteLink(a, typeof v === 'string' && v ? v : a.getAttribute('href'));
    });

    /* ---------- conversation track: lights up once, at 40 % visibility (source: class "lit" on the <ol>) ---------- */
    var track = root.querySelector('[data-pfo-cv]');
    var io = null;
    if (track) {
      track.classList.remove('pfo-lit'); // a copied live root starts from the source's initial state
      if (!('IntersectionObserver' in window)) track.classList.add('pfo-lit');
      else {
        io = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('pfo-lit'); io.disconnect(); } });
        }, { threshold: OPTIONS.trackThreshold });
        io.observe(track);
      }
    }

    /* ================= SITE HEADER + FOOTER (shared site chrome) ================= */
    var chrome = siteChrome(root, cfg, on, timers);

    /* ================= SHARED SCROLL MOTION (design/bwci-motion.js) =================
       bwci-motion skips sections with id "hero" or class hero / hero-fe: this hero is .hero (here .pfo-hero). */
    var motion = siteMotion(root, { heroId: null, heroSel: '.pfo-hero' }, on);

    /* ================= GoHighLevel re-render detection ================= */
    var instance = {
      root: root,
      destroy: function () {
        if (instance.destroyed) return;
        instance.destroyed = true;
        if (chrome) chrome.destroy();
        if (motion) motion.destroy();
        if (io) io.disconnect();
        if (ac) ac.abort();
        cleanups.forEach(function (fn) { fn(); });
        delete root.dataset.pfoInit;
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
    if (root) root.dataset.pfoInit = 'true';
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
