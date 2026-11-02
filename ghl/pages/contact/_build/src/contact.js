/* BWCI — Contact · GoHighLevel runtime (vanilla JS, no dependencies).
   Replaces the Claude Design runtime (support.js + React) used by design/Contact.dc.html and its SiteHeader /
   Breadcrumb / SiteFooter components and bwci-motion.js. Everything is scoped to #bwci-contact. The page's own
   text/x-dc component is reproduced below: its three props (the visitor office, the map and the Providence Asset
   Management panel) and the five copy buttons with their "copied" state and spoken message. */
(function () {
  'use strict';

  /* Editable settings (logo and hero image URLs, header/footer toggles, the "showVisitorOffice", "showPam" and
     "showMap" source props, footer legal wording, page links, emails and phone) live in the
     <script type="application/json" id="bwci-contact-config"> block at the very top of the Custom Code paste, not
     here. */

  var ROOT_ID = 'bwci-contact';
  var CONFIG_ID = 'bwci-contact-config';
  var INSTANCE_KEY = '__bwciContact';

  /* ======================= BEHAVIOUR (source values) ======================= */
  var OPTIONS = {
    copiedFor: 1600 // ms a copy button shows its tick (and the message stays) after a copy
  };
  // source K: each copy button's spoken label, the text the source copies, and the link whose configured address
  // (mailto: / tel:) is copied instead once it is set
  var COPY = {
    no: { label: 'company number', text: '09881564' },
    ge: { label: 'general enquiries email', text: '[email]', link: 'contactEmail' },
    gp: { label: 'general enquiries phone', text: '[phone]', link: 'contactPhone' },
    me: { label: 'media email', text: '[email]', link: 'mediaEmail' },
    se: { label: 'shareholder email', text: '[email or registrar details]', link: 'irEmail' }
  };

/*@site-chrome*/

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function scrollBehavior() { return prefersReducedMotion() ? 'auto' : 'smooth'; }
  // the address of a usable mailto: / tel: value (scheme and query removed), else null
  function addressOf(url) {
    if (typeof url !== 'string') return null;
    var m = /^(?:mailto|tel):([^?#]+)/i.exec(url.trim());
    if (!m) return null;
    try { return decodeURIComponent(m[1]); } catch (err) { return m[1]; }
  }

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

    /* hero image (source: ./assets/contact-hero-hands.png): the configured URL, else no image */
    qa('img[data-cnt-asset="contactHeroImage"]').forEach(function (img) {
      var url = cfg.contactHeroImage;
      var valid = siteImageAvailable(url);
      img.hidden = !valid;
      if (valid) { if (img.getAttribute('src') !== url) img.src = url; }
      else img.removeAttribute('src');
    });

    /* source props (sc-if): the visitor office (default true), the map (default false) and the Providence Asset
       Management panel (default true). A non-boolean value keeps the default. */
    function flag(key, def) { return typeof cfg[key] === 'boolean' ? cfg[key] : def; }
    qa('[data-cnt-visitor]').forEach(function (el) { el.hidden = !flag('showVisitorOffice', true); });
    qa('[data-cnt-map]').forEach(function (el) { el.hidden = !flag('showMap', false); });
    qa('[data-cnt-pam]').forEach(function (el) { el.hidden = !flag('showPam', true); });

    siteResolveLinks(cfg);
    var links = cfg.links || {};
    qa('a[data-cnt-link]').forEach(function (a) {
      var v = links[a.getAttribute('data-cnt-link')];
      siteLink(a, typeof v === 'string' && v ? v : a.getAttribute('href'));
    });

    /* ---------- "Contact details": smooth scroll to the section (source used html{scroll-behavior:smooth}) ---------- */
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

    /* ---------- copy buttons (source state "copied": one key at a time, cleared after 1.6 s) ---------- */
    var live = root.querySelector('[data-cnt-live] .cnt-i');
    var copyBtns = qa('button[data-cnt-copy]');
    var copied = '';
    var copyTimer = null;
    var stopped = false;
    function renderCopied() {
      copyBtns.forEach(function (b) {
        var k = b.getAttribute('data-cnt-copy');
        if (!COPY[k]) return;
        b.setAttribute('data-copied', copied === k ? 'true' : 'false');
        b.setAttribute('aria-label', copied === k ? 'Copied' : 'Copy ' + COPY[k].label);
      });
      if (live) live.textContent = copied ? COPY[copied].label.charAt(0).toUpperCase() + COPY[copied].label.slice(1) + ' copied' : '';
    }
    renderCopied(); // a copied live root starts in the source's initial state
    copyBtns.forEach(function (b) {
      var k = b.getAttribute('data-cnt-copy');
      if (!COPY[k]) return;
      on(b, 'click', function () {
        var item = COPY[k];
        var text = (item.link && addressOf(links[item.link])) || item.text;
        function done() {
          if (stopped) return; // the clipboard promise settled after a teardown
          copied = k;
          renderCopied();
          clearTimeout(copyTimer);
          copyTimer = setTimeout(function () { copied = ''; renderCopied(); }, OPTIONS.copiedFor);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done);
        else done();
      });
    });

    /* ================= SITE HEADER + FOOTER (shared site chrome) ================= */
    var chrome = siteChrome(root, cfg, on, timers);

    /* ================= SHARED SCROLL MOTION (design/bwci-motion.js) =================
       bwci-motion skips sections with id "hero" or class hero / hero-fe: this hero is .hero (here .cnt-hero). */
    var motion = siteMotion(root, { heroId: null, heroSel: '.cnt-hero' }, on);

    /* ================= GoHighLevel re-render detection ================= */
    var instance = {
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
        delete root.dataset.cntInit;
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
    if (root) root.dataset.cntInit = 'true';
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
