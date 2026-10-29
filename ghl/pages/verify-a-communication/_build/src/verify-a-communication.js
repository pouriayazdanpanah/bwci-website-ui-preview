/* BWCI — Verify a Communication · GoHighLevel runtime (vanilla JS, no dependencies).
   Replaces the Claude Design runtime (support.js + React) used by design/Verify a Communication.dc.html and its
   SiteHeader / Breadcrumb / SiteFooter components and bwci-motion.js. Everything is scoped to
   #bwci-verify-a-communication. The page's own text/x-dc component shows or hides the review badges, the former-name
   row and the alerts section from its props, and runs the "Copy" button; both are reproduced below. */
(function () {
  'use strict';

  /* Editable settings (logo and portrait image URLs, header/footer toggles, footer legal wording, page links)
     live in the <script type="application/json" id="bwci-verify-a-communication-config"> block at the very top of the Custom
     Code paste, not here. The source props are "showFlags",
     "showFormerName" and "showAlerts". */

  var ROOT_ID = 'bwci-verify-a-communication';
  var CONFIG_ID = 'bwci-verify-a-communication-config';
  var INSTANCE_KEY = '__bwciVerifyACommunication';

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
    siteResolveImages(root,cfg);

    siteResolveLinks(cfg);
    var links = cfg.links || {};
    qa('a[data-vfc-link]').forEach(function (a) {
      var v = links[a.getAttribute('data-vfc-link')];
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

    /* ---------- source props: review badges, former-name row, alerts section (applied before the scroll motion
       scans, as the source renders them) ---------- */
    function flag(key, def) { return typeof cfg[key] === 'boolean' ? cfg[key] : def; }
    qa('[data-vfc-flag]').forEach(function (el) { el.hidden = !flag('showFlags', false); });
    qa('[data-vfc-former]').forEach(function (el) { el.hidden = !flag('showFormerName', true); });
    qa('[data-vfc-alerts]').forEach(function (el) { el.hidden = !flag('showAlerts', false); });

    /* ---------- "Copy" (report@phishing.gov.uk): clipboard when available; "Copied" for 1.8 s either way ---------- */
    var copyBtn = root.querySelector('[data-vfc-copy]');
    var copyLabel = root.querySelector('[data-vfc-copy-label] .vfc-i');
    var copyTimer = null;
    var stopped = false;
    function setCopied(c) {
      if (!copyBtn) return;
      copyBtn.setAttribute('data-done', c ? 'true' : 'false');
      copyBtn.setAttribute('aria-label', c ? 'Copied report@phishing.gov.uk' : 'Copy report@phishing.gov.uk');
      if (copyLabel) copyLabel.textContent = c ? 'Copied' : 'Copy';
    }
    if (copyBtn) {
      setCopied(false); // a copied live root starts in the source's initial state
      on(copyBtn, 'click', function () {
        function done() {
          if (stopped) return; // the clipboard promise settled after a teardown
          setCopied(true);
          clearTimeout(copyTimer);
          copyTimer = setTimeout(function () { setCopied(false); }, 1800);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText('report@phishing.gov.uk').then(done, done);
        else done();
      });
    }

    /* ================= SITE HEADER + FOOTER (shared site chrome) ================= */
    var chrome = siteChrome(root, cfg, on, timers);

    /* ================= SHARED SCROLL MOTION (design/bwci-motion.js) =================
       bwci-motion skips sections with id "hero" or class hero / hero-fe; this hero (#vfc-top.pg-hero) has neither,
       so it is scanned like the other sections (its content starts on screen and stays untagged). */
    var motion = siteMotion(root, { heroId: null, heroSel: ':not(*)' }, on);

    /* ================= GoHighLevel re-render detection ================= */
    var instance;
    function guardConnected() { return root.isConnected; }

    instance = {
      root: root,
      destroy: function () {
        if (instance.destroyed) return;
        instance.destroyed = true;
        if (chrome) chrome.destroy();
        if (motion) motion.destroy();
        stopped = true;
        clearTimeout(copyTimer);
        if (ac) ac.abort();
        cleanups.forEach(function (fn) { fn(); });
        delete root.dataset.vfcInit;
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
    if (root) root.dataset.vfcInit = 'true';
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
